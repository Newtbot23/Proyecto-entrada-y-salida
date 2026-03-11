<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Http\Requests\DynamicTableRequest;

class DynamicTableController extends Controller
{
    private $blacklistedTables = [
        'cache',
        'cache_locks',
        'password_reset_codes',
        'personal_access_tokens',
        'migrations',
        'failed_jobs',
        'roles',
        'password_reset_tokens'
    ];

    /**
     * Get list of tables with 5 or fewer columns.
     */
    public function getShortTables()
    {
        $tables = DB::select('SHOW TABLES');
        $shortTables = [];
        $dbName = env('DB_DATABASE', 'forge');
        $key = "Tables_in_" . $dbName;

        foreach ($tables as $table) {
            // Check if the property exists, if not, try to find the first property
            $tableName = $table->$key ?? reset($table);

            // Skip blacklisted tables
            if (in_array($tableName, $this->blacklistedTables)) {
                continue;
            }

            $columns = Schema::getColumnListing($tableName);
            if (count($columns) <= 5) {
                $shortTables[] = $tableName;
            }
        }

        return response()->json(['data' => $shortTables]);
    }

    /**
     * Get the schema (columns and types) of a specific table.
     */
    public function getTableSchema(Request $request, $table)
    {
        if (in_array($table, $this->blacklistedTables)) {
            return response()->json(['error' => 'Unauthorized table'], 403);
        }

        if (!Schema::hasTable($table)) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        $dbName = env('DB_DATABASE');

        // Fetch foreign keys from information_schema
        $foreignKeys = DB::select("
            SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = ? 
            AND TABLE_NAME = ?
        ", [$dbName, $table]);

        // Build the foreign key map
        $foreignKeyMap = [];
        foreach ($foreignKeys as $fk) {
            $foreignKeyMap[$fk->COLUMN_NAME] = [
                'table' => $fk->REFERENCED_TABLE_NAME,
                'column' => $fk->REFERENCED_COLUMN_NAME
            ];
        }

        $columns = DB::select("SHOW COLUMNS FROM `$table`");
        $schema = [];

        // Definition of foreign key relationships for the dynamic system
        $foreignKeyMap = [
            'id_nave' => ['table' => 'naves', 'column' => 'id', 'label' => 'nave'],
            'id_tipo_vehiculo' => ['table' => 'tipos_vehiculo', 'column' => 'id', 'label' => 'tipo_vehiculo'],
            'id_marca' => ['table' => 'marcas_equipo', 'column' => 'id', 'label' => 'marca'],
            'id_rol' => ['table' => 'roles', 'column' => 'id', 'label' => 'rol'],
        ];

        foreach ($columns as $column) {
            $isAutoIncrement = str_contains(strtolower($column->Extra), 'auto_increment');
            $foreign = null;

            if (isset($foreignKeyMap[$column->Field])) {
                $refTable = $foreignKeyMap[$column->Field]['table'];
                $refColumn = $foreignKeyMap[$column->Field]['column'];

                // Find a good label column in the referenced table
                $refSchema = DB::select("SHOW COLUMNS FROM `$refTable`");
                $labelCol = $refColumn; // fallback to ID
                foreach ($refSchema as $refCol) {
                    if (str_contains($refCol->Type, 'varchar') || str_contains($refCol->Type, 'text')) {
                        $labelCol = $refCol->Field;
                        break;
                    }
                }

                $optionsQuery = DB::table($refTable)->select(["$refColumn as value", "$labelCol as label"]);

                // Filter options by NIT if applicable
                $user = $request->user();
                if ($user instanceof \App\Models\Usuarios) {
                    if (Schema::hasColumn($refTable, 'nit_entidad')) {
                        $optionsQuery->where('nit_entidad', $user->nit_entidad);
                    }
                }

                $optionsData = $optionsQuery->get();

                $foreign = [
                    'table' => $refTable,
                    'options' => $optionsData
                ];
            }

            $schema[] = [
                'name' => $column->Field,
                'type' => $column->Type,
                'required' => $column->Null === 'NO',
                'default' => $column->Default,
                'key' => $column->Key,
                'auto_increment' => $isAutoIncrement,
                'foreign' => $foreign
            ];
        }

        return response()->json(['data' => $schema]);
    }

    /**
     * Get all records from the table.
     */
    public function index(Request $request, $table)
    {
        if (in_array($table, $this->blacklistedTables)) {
            return response()->json(['error' => 'Unauthorized table'], 403);
        }

        if (!Schema::hasTable($table)) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        $query = DB::table($table);

        // Filter by nit_entidad if the user is a NormalAdmin and the table has the column
        $user = $request->user();
        if ($user instanceof \App\Models\Usuarios) {
            if (Schema::hasColumn($table, 'nit_entidad')) {
                $query->where('nit_entidad', $user->nit_entidad);
            }
        }

        $perPage = $request->query('per_page', 50);
        $data = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $data->items(),
                'total' => $data->total(),
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'last_page' => $data->lastPage(),
            ]
        ]);
    }

    /**
     * Store a new record in the table.
     */
    public function store(DynamicTableRequest $request, $table)
    {
        if (in_array($table, $this->blacklistedTables)) {
            return response()->json(['error' => 'Unauthorized table'], 403);
        }

        if (!Schema::hasTable($table)) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        try {
            // Find the primary key column
            $columns = DB::select("SHOW COLUMNS FROM `$table`");
            $primaryKey = 'id';
            $isAutoIncrement = false;

            foreach ($columns as $column) {
                if ($column->Key === 'PRI') {
                    $primaryKey = $column->Field;
                    $isAutoIncrement = str_contains(strtolower($column->Extra), 'auto_increment');
                    break;
                }
            }

            $dataToInsert = $request->all();

            // Automatically inject nit_entidad if the user is a NormalAdmin and the table has the column
            $user = $request->user();
            if ($user instanceof \App\Models\Usuarios) {
                if (Schema::hasColumn($table, 'nit_entidad')) {
                    $dataToInsert['nit_entidad'] = $user->nit_entidad;
                }
            }

            if ($isAutoIncrement) {
                $insertedId = DB::table($table)->insertGetId($dataToInsert);
                // Fetch the created record
                $newItem = DB::table($table)->where($primaryKey, $insertedId)->first();
            } else {
                DB::table($table)->insert($dataToInsert);
                // Fetch the created record using the provided primary key in the request
                $insertedId = $dataToInsert[$primaryKey] ?? null;
                $newItem = DB::table($table)->where($primaryKey, $insertedId)->first();
            }

            return response()->json(['data' => $newItem], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error: El registro ya existe (registro duplicado).',
                    'error' => 'Duplicate entry'
                ], 409);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an existing record in the table.
     */
    public function update(DynamicTableRequest $request, $table, $id)
    {
        if (in_array($table, $this->blacklistedTables)) {
            return response()->json(['error' => 'Unauthorized table'], 403);
        }

        if (!Schema::hasTable($table)) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        try {
            // Find the primary key column
            $columns = DB::select("SHOW COLUMNS FROM `$table`");
            $primaryKey = 'id';

            foreach ($columns as $column) {
                if ($column->Key === 'PRI') {
                    $primaryKey = $column->Field;
                    break;
                }
            }

            $query = DB::table($table)->where($primaryKey, $id);

            // Security check: ensure the record belongs to the NormalAdmin's entity
            $user = $request->user();
            if ($user instanceof \App\Models\Usuarios) {
                if (Schema::hasColumn($table, 'nit_entidad')) {
                    $query->where('nit_entidad', $user->nit_entidad);
                }
            }

            $record = $query->first();
            if (!$record) {
                return response()->json(['error' => 'Record not found or unauthorized'], 404);
            }

            // Exclude fields that shouldn't be updated manually
            $data = $request->except([$primaryKey, 'created_at', 'updated_at', 'nit_entidad']);

            DB::table($table)->where($primaryKey, $id)->update($data);

            $updatedItem = DB::table($table)->where($primaryKey, $id)->first();

            return response()->json(['data' => $updatedItem], 200);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error: El registro ya existe (registro duplicado).',
                    'error' => 'Duplicate entry'
                ], 409);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
