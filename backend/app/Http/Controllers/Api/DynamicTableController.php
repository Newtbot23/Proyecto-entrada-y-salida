<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DynamicTableController extends Controller
{
    private $blacklistedTables = [
        'cache', 
        'cache_locks', 
        'password_reset_codes', 
        'personal_access_tokens',
        'migrations',
        'failed_jobs',
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
    public function getTableSchema($table)
    {
        if (in_array($table, $this->blacklistedTables)) {
            return response()->json(['error' => 'Unauthorized table'], 403);
        }

        if (!Schema::hasTable($table)) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        $columns = DB::select("SHOW COLUMNS FROM `$table`");
        $schema = [];

        foreach ($columns as $column) {
            $schema[] = [
                'name' => $column->Field,
                'type' => $column->Type,
                'required' => $column->Null === 'NO',
                'default' => $column->Default,
                'key' => $column->Key
            ];
        }

        return response()->json(['data' => $schema]);
    }

    /**
     * Get all records from the table.
     */
    public function index($table)
    {
        if (in_array($table, $this->blacklistedTables)) {
            return response()->json(['error' => 'Unauthorized table'], 403);
        }

        if (!Schema::hasTable($table)) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        $data = DB::table($table)->get();
        return response()->json(['data' => $data]);
    }

    /**
     * Store a new record in the table.
     */
    public function store(Request $request, $table)
    {
        if (in_array($table, $this->blacklistedTables)) {
            return response()->json(['error' => 'Unauthorized table'], 403);
        }

        if (!Schema::hasTable($table)) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        try {
            
            $id = DB::table($table)->insertGetId($request->all());
            
            // Fetch the created record
            $newItem = DB::table($table)->where('id', $id)->first();

            return response()->json(['data' => $newItem], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an existing record in the table.
     */
    public function update(Request $request, $table, $id)
    {
        if (in_array($table, $this->blacklistedTables)) {
            return response()->json(['error' => 'Unauthorized table'], 403);
        }

        if (!Schema::hasTable($table)) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        try {
            // We assume the table has an 'id' column as many of our tables do
            $exists = DB::table($table)->where('id', $id)->exists();
            if (!$exists) {
                return response()->json(['error' => 'Record not found'], 404);
            }

            // Exclude common fields that shouldn't be updated manually if they exist
            $data = $request->except(['id', 'created_at', 'updated_at']);
            
            DB::table($table)->where('id', $id)->update($data);
            
            $updatedItem = DB::table($table)->where('id', $id)->first();

            return response()->json(['data' => $updatedItem], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
