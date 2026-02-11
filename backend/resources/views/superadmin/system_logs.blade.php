<div class="system-logs">

    <!-- Filtros -->
    <div class="filters">
        <input type="text" name="search" placeholder="Search...">

        <select name="date_range">
            <option value="">Date Range</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
        </select>

        <select name="action_type">
            <option value="">Action Type</option>
            <option value="login">Login</option>
            <option value="create">Create</option>
            <option value="view">View</option>
        </select>

        <select name="severity_level">
            <option value="">Severity Level</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
        </select>
    </div>

    <!-- Tabla -->
    <table>
        <thead>
            <tr>
                <th>Date & Time</th>
                <th>User / System Actor</th>
                <th>Action Performed</th>
                <th>Affected Entity</th>
                <th>Result</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($logs as $log)
                <tr>
                    <td>{{ $log->date_time }}</td>
                    <td>{{ $log->actor }}</td>
                    <td>{{ $log->action }}</td>
                    <td>{{ $log->entity }}</td>
                    <td>{{ $log->result }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Paginación -->
    <div class="pagination">
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>Next</button>
    </div>

</div>
