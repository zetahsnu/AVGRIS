<?php

class manager_model extends Model {

    public $table = null;
    private $pk_word = ['IDNO', 'SISN'];

    public function __construct() {
        parent::__construct();
    }

    /**
     * 檢查使用者帳號、密碼
     * @param type $username
     * @param type $password
     * @return boolean
     */
    public function checkUser($username = '', $password = '') {
        if ($username !== '' && $password !== '') {
            $exes = [];

            $pdo = $this->db->prepare('SELECT COUNT(*) FROM users WHERE USERNAME = :USERNAME and PASSWORD = :PASSWORD LIMIT 1');
            $exes[':USERNAME'] = $username;
            $exes[':PASSWORD'] = hash('sha256', $password);

            if ($pdo->execute($exes)) {
                return $pdo->fetchColumn() === '1' ? true : false;
            } else {
                return $pdo->errorInfo()[2];
            }
        } else {
            return 'Username and password can\' be empty';
        }
    }

    /**
     * 取得使用者資訊
     * @param type $username
     * @return type
     */
    public function getUserInfo($username = '') {
        if ($username !== '') {
            $exes = [];

            $pdo = $this->db->prepare('SELECT ID,USERNAME,JURISDICTION,TABLES FROM users WHERE USERNAME = :USERNAME LIMIT 1');
            $exes[':USERNAME'] = $username;

            $pdo->setFetchMode(PDO::FETCH_ASSOC);
            $pdo->execute($exes);

            return $pdo->fetch();
        } else {
            return [];
        }
    }

    public function getPeoples($jurisdiction = null, $comparison = '=') {
        if ($jurisdiction !== null) {
            $exes = [];

            $pdo = $this->db->prepare("SELECT ID, USERNAME, TABLES FROM users WHERE JURISDICTION {$comparison} :JURISDICTION ORDER BY USERNAME ASC");
            $exes[':JURISDICTION'] = $jurisdiction;

            $pdo->setFetchMode(PDO::FETCH_ASSOC);
            $pdo->execute($exes);

            return $pdo->fetchAll();
        } else {
            return [];
        }
    }

    public function getInvMT($vi = null, $variant = '') {
        $exes = [];

        $sql = 'SELECT IDNO,MT FROM seedinventory WHERE VINO = :VINO';

        if ($variant != '') {
            $sql .= ' AND VARIANT = :VARIANT';
            $exes[':VARIANT'] = $variant;
        }

        $sql .= ' LIMIT 1';

        $pdo = $this->db->prepare($sql);
        $exes[':VINO'] = $vi;

        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        return $pdo->fetch();
    }

    public function updateUserTables($id, $tables) {
        $exes = [];

        $pdo = $this->db->prepare('UPDATE users SET TABLES = :TABLES WHERE ID = :ID');
        $exes[':TABLES'] = $tables;
        $exes[':ID'] = $id;

        return $pdo->execute($exes) ? true : $pdo->errorInfo()[2];
    }

    public function changeUserPassword($id, $password) {
        $exes = [];

        $pdo = $this->db->prepare('UPDATE users SET PASSWORD = :PASSWORD WHERE ID = :ID');
        $exes[':PASSWORD'] = hash('sha256', $password);
        $exes[':ID'] = $id;

        return $pdo->execute($exes) ? true : $pdo->errorInfo()[2];
    }

    public function getVINO($vino) {
        $exes = [];

        $pdo = $this->db->prepare("SELECT VINO FROM {$this->table} WHERE VINO REGEXP :VINO LIMIT 10;");
        $exes[':VINO'] = $vino;

        $pdo->execute($exes);

        return $pdo->fetchAll(PDO::FETCH_COLUMN, 0);
    }

    public function getPasInfo($vino) {
        $exes = [];

        $pdo = $this->db->prepare("SELECT ACCNO,GENUS,SPECIES,DUPLIC,SUBTAXA,TEMPNO FROM {$this->table} WHERE VINO REGEXP :VINO LIMIT 1;");
        $exes[':VINO'] = $vino;

        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        return $pdo->fetchAll();
    }

    public function updateTableData($data = []) {
        switch ($this->table) {
            case 'brassica':
                //TODO:需要修正
                $columns = $this->getColumns('brassica');
                foreach ($data as $d) {
                    $first = [];
                    $second = [];
                    foreach ($d as $key => $value) {
                        if ($key === 'IDNO') {
                            $second[$key] = $value;
                        }
                        if (in_array($key, $columns)) {
                            $first[$key] = $value;
                        } else {
                            $second[$key] = $value;
                        }
                    }

                    if (count($first) > 1) {
                        $insert_values = [];
                        $question_marks = '(' . $this->placeholders('?', sizeof($first)) . ')';
                        $insert_values = array_merge($insert_values, array_values($first));

                        $icolumns = '(';

                        $keys = array_keys($first);
                        $klen = count($keys);
                        $k = 1;
                        foreach ($keys as $key) {
                            $icolumns .= $key;
                            $icolumns .= $klen === $k ? ')' : ', ';
                            $k++;
                        }

                        $sql = "INSERT INTO {$this->table} {$icolumns} VALUES " . $question_marks . " ON DUPLICATE KEY UPDATE ";

                        foreach ($keys as $key) {
                            if (!in_array($key, $this->pk_word)) {
                                $sql .= $key . '=VALUES(' . $key . '),';
                            }
                        }

                        $sql = rtrim($sql, ',');

                        $pdo = $this->db->prepare($sql);

                        if (!$pdo->execute($insert_values)) {
                            return $pdo->errorInfo()[2];
                        }
                    }

                    if (count($second) > 1) {
                        $insert_values = [];
                        $question_marks = '(' . $this->placeholders('?', sizeof($second)) . ')';
                        $insert_values = array_merge($insert_values, array_values($second));

                        $icolumns = '(';

                        $keys = array_keys($second);
                        $klen = count($keys);
                        $k = 1;
                        foreach ($keys as $key) {
                            $icolumns .= $key;
                            $icolumns .= $klen === $k ? ')' : ', ';
                            $k++;
                        }

                        $sql = "INSERT INTO {$this->table}_second {$icolumns} VALUES " . $question_marks . " ON DUPLICATE KEY UPDATE ";

                        foreach ($keys as $key) {
                            if (!in_array($key, $this->pk_word)) {
                                $sql .= $key . '=VALUES(' . $key . '),';
                            }
                        }

                        $sql = rtrim($sql, ',');

                        $pdo = $this->db->prepare($sql);
                        
                        if (!$pdo->execute($insert_values)) {
                            return $pdo->errorInfo()[2];
                        }
                    }
                }
                return true;
                break;
            default :
                $insert_values = [];
                foreach ($data as $d) {
                    $question_marks[] = '(' . $this->placeholders('?', sizeof($d)) . ')';
                    $insert_values = array_merge($insert_values, array_values($d));
                }

                $columns = '(';

                $keys = array_keys($data[0]);
                $klen = count($keys);
                $k = 1;
                foreach ($keys as $key) {
                    $columns .= $key;
                    $columns .= $klen === $k ? ')' : ', ';
                    $k++;
                }

                $sql = "INSERT INTO {$this->table} {$columns} VALUES " . implode(',', $question_marks) . " ON DUPLICATE KEY UPDATE ";

                foreach ($keys as $key) {
                    if (!in_array($key, $this->pk_word)) {
                        $sql .= $key . '=VALUES(' . $key . '),';
                    }
                }

                $sql = rtrim($sql, ',');

                $pdo = $this->db->prepare($sql);

                return $pdo->execute($insert_values) ? true : $pdo->errorInfo()[2];
        }
    }

    public function insertTableData($data = []) {
        switch ($this->table) {
            case 'brassica':
                //TODO:需要修正
                $columns = $this->getColumns('brassica');
                foreach ($data as $d) {
                    $first = [];
                    $second = [];
                    foreach ($d as $key => $value) {
                        if (in_array($key, $columns)) {
                            $first[$key] = $value;
                        } else {
                            $second[$key] = $value;
                        }
                    }

                    if (count($first) === 0 && count($second) > 0) {
                        $sql = "INSERT INTO {$this->table} VALUES();";

                        $pdo = $this->db->prepare($sql);

                        $pdo->execute();
                    } else {
                        $insert_values = [];
                        $question_marks = '(' . $this->placeholders('?', sizeof($first)) . ')';
                        $insert_values = array_merge($insert_values, array_values($first));

                        $icolumns = '(';

                        $keys = array_keys($first);
                        $klen = count($keys);
                        $k = 1;
                        foreach ($keys as $key) {
                            $icolumns .= $key;
                            $icolumns .= $klen === $k ? ')' : ', ';
                            $k++;
                        }

                        $sql = "INSERT INTO {$this->table} {$icolumns} VALUES " . $question_marks . ";";

                        $pdo = $this->db->prepare($sql);

                        if (!$pdo->execute($insert_values)) {
                            return $pdo->errorInfo()[2];
                        }
                    }

                    $lastID = $this->getLastInsertId();

                    $second['IDNO'] = $lastID > 0 ? $lastID : '';

                    if (count($second) > 0 && isset($second['IDNO'])) {
                        $insert_values = [];
                        $question_marks = '(' . $this->placeholders('?', sizeof($second)) . ')';
                        $insert_values = array_merge($insert_values, array_values($second));

                        $icolumns = '(';

                        $keys = array_keys($second);
                        $klen = count($keys);
                        $k = 1;
                        foreach ($keys as $key) {
                            $icolumns .= $key;
                            $icolumns .= $klen === $k ? ')' : ', ';
                            $k++;
                        }

                        $sql = "INSERT INTO {$this->table}_second {$icolumns} VALUES " . $question_marks . ";";

                        $pdo = $this->db->prepare($sql);

                        if (!$pdo->execute($insert_values)) {
                            $this->deleteTableData('IDNO', [$lastID]);
                            $error = $pdo->errorInfo()[2];

                            $sql = "ALTER TABLE {$this->table} AUTO_INCREMENT = {$lastID} ;";
                            $pdo = $this->db->prepare($sql);
                            $pdo->execute();

                            return $error;
                        }
                    }
                }
                return true;
                break;
            default :
                $insert_values = [];
                foreach ($data as $d) {
                    $question_marks[] = '(' . $this->placeholders('?', sizeof($d)) . ')';
                    $insert_values = array_merge($insert_values, array_values($d));
                }

                $columns = '(';

                $keys = array_keys($data[0]);
                $klen = count($keys);
                $k = 1;
                foreach ($keys as $key) {
                    $columns .= $key;
                    $columns .= $klen === $k ? ')' : ', ';
                    $k++;
                }

                $sql = "INSERT INTO {$this->table} {$columns} VALUES " . implode(',', $question_marks);
                
                $pdo = $this->db->prepare($sql);

                return $pdo->execute($insert_values) ? true : $pdo->errorInfo()[2];
        }
    }

    public function getLastInsertId() {
        if ($this->table !== 'brassica') {
            return $this->db->lastInsertId();
        } else {
            $pdo = $this->db->query("SELECT LAST_INSERT_ID()");
            $lastId = $pdo->fetch(PDO::FETCH_NUM);
            return $lastId[0];
        }
    }

    public function getDataFromID($pk, $id) {
        $exes = [];

        $pdo = $this->db->prepare("SELECT * FROM {$this->table}_manager WHERE {$pk} = :PK LIMIT 1");
        $exes[':PK'] = $id;

        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        return $pdo->fetch();
    }

    public function deleteTableData($pk = null, $ids = []) {
        $sql = "DELETE FROM {$this->table} WHERE {$pk} IN (" . $this->placeholders('?', sizeof($ids)) . ");";

        $pdo = $this->db->prepare($sql);

        return $pdo->execute($ids) ? true : $pdo->errorInfo()[2];
    }

    public function exportRow($columns = [], $filters = [], $orders = []) {
        $exes = [];

        $sql = "SELECT DISTINCT " . implode(',', array_map([$this, "columnWithTable"], $columns)) . " FROM {$this->table}_manager ";

        if ($this->table === 'seeddist') {
            $sql .= "LEFT JOIN detail ON {$this->table}_manager.IDNO = detail.IDNO LEFT JOIN crop ON detail.CROP = crop.CROP ";
        }

        if (count($filters) > 0) {
            $this->appendFilters($filters, $sql, $exes);
        }

        if (count($orders) > 0) {
            $this->appendOrders($orders, $sql);
        }

        $pdo = $this->db->prepare($sql);
        $pdo->execute($exes);

        return $pdo->fetchAll(PDO::FETCH_NUM);
    }

    private function columnWithTable($value) {
        return "{$this->table}_manager." . $value;
    }

    public function exportSubRow($table = null, $ids = []) {
        $sql = "SELECT * FROM {$table} WHERE ";

        switch ($table) {
            case 'passport_yrreg_streg':
                $sql.= 'VINO IN (' . $this->placeholders('?', sizeof($ids)) . ')';
                break;
            case 'detail':
                $sql .= 'IDNO IN (' . $this->placeholders('?', sizeof($ids)) . ')';
                break;
        }

        $pdo = $this->db->prepare($sql);
        $pdo->execute($ids);

        return $pdo->fetchAll(PDO::FETCH_NUM);
    }

    public function fetchOffsetRow($offset = 1, $limitRow = 20, $filters = [], $orders = []) {
        $index = ($offset - 1) * $limitRow;

        $columns = $this->getColumns();

        $sql = "SELECT DISTINCT " . implode(',', array_map([$this, "columnWithTable"], $columns)) . " FROM {$this->table}_manager ";
        $exes = [];

        if ($this->table === 'seeddist') {
            $sql .= "LEFT JOIN detail ON {$this->table}_manager.IDNO = detail.IDNO LEFT JOIN crop ON detail.CROP = crop.CROP ";
        }

        if (count($filters) > 0) {
            $this->appendFilters($filters, $sql, $exes);
        }

        if (count($orders) > 0) {
            $this->appendOrders($orders, $sql);
        }

        $sql .= " LIMIT {$index},{$limitRow};";

        $pdo = $this->db->prepare($sql);
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        return $pdo->fetchAll();
    }

    public function getColumns($page = null) {
        if ($page === null) {
            $pdo = $this->db->prepare("DESCRIBE {$this->table}_manager");
        } else {
            $pdo = $this->db->prepare("DESCRIBE {$page}");
        }
        $pdo->execute();

        return $pdo->fetchAll(PDO::FETCH_COLUMN);
    }

    public function getColumnRelatedData($column) {
        $pdo = $this->db->prepare("SELECT * FROM {$this->table}_{$column}");
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute();

        return $pdo->fetchAll();
    }

    public function getSubtableColumnRelatedData($table) {
        $pdo = $this->db->prepare("SELECT * FROM {$table} ORDER BY CROP");
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute();

        return $pdo->fetchAll();
    }

    public function getOtherRelatedData($table, $filter = []) {
        $exes = [];

        $sql = "SELECT * FROM {$table} ";

        if (count($filter) > 0) {
            $sql .= "WHERE ";
            foreach ($filter as $key => $value) {
                $sql.= $key . ' = :' . $key;
                $exes[':' . $key] = $value;
            }
        }

        $pdo = $this->db->prepare($sql);
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        return $pdo->fetchAll();
    }

    public function getRelatedData() {
        $pdo = $this->db->prepare("SELECT * FROM {$this->table} ORDER BY " . $this->getPkColumnName());
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute();

        return $pdo->fetchAll();
    }

    public function getPkColumnName() {
        $pdo = $this->db->prepare("SHOW KEYS FROM {$this->table} where Key_name = 'PRIMARY';");
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute();

        $result = $pdo->fetch();

        return $result['Column_name'];
    }

    public function deleteOtherRelatedData($ids = []) {
        $sql = "DELETE FROM {$this->table} WHERE " . $this->getPkColumnName() . " IN (" . $this->placeholders('?', sizeof($ids)) . ");";

        $pdo = $this->db->prepare($sql);

        return $pdo->execute($ids) ? true : $pdo->errorInfo()[2];
    }

    public function deleteRelatedData($ids = []) {
        $sql = "DELETE FROM {$this->table} WHERE " . $this->getPkColumnName() . " IN (" . $this->placeholders('?', sizeof($ids)) . ");";

        $pdo = $this->db->prepare($sql);

        return $pdo->execute($ids) ? true : $pdo->errorInfo()[2];
    }

    public function insertOtherRelatedData($data = [], $column = []) {
        
        $insert_values = [];
        foreach ($data as $d) {
            $question_marks[] = '(' . $this->placeholders('?', sizeof($d) + 1) . ')';
            $insert_values [] = $column[key($column)];
            $insert_values = array_merge($insert_values, array_values($d));
        }

        $columns = '(' . key($column) . ', ';
        
        $keys = array_keys($data[0]);
        $klen = count($keys);
        $k = 1;
        foreach ($keys as $key) {
            $columns .= $key;
            $columns .= $klen === $k ? ')' : ', ';
            $k++;
        }

        $sql = "INSERT INTO {$this->table} {$columns} VALUES " . implode(',', $question_marks);

        $pdo = $this->db->prepare($sql);

        return $pdo->execute($insert_values) ? true : $pdo->errorInfo()[2];
    }

    public function insertRealtedData($data = []) {
        $insert_values = [];
        foreach ($data as $d) {
            $question_marks[] = '(' . $this->placeholders('?', sizeof($d)) . ')';
            $insert_values = array_merge($insert_values, array_values($d));
        }

        $columns = '(';

        $keys = array_keys($data[0]);
        $klen = count($keys);
        $k = 1;
        foreach ($keys as $key) {
            $columns .= $key;
            $columns .= $klen === $k ? ')' : ', ';
            $k++;
        }

        $sql = "INSERT INTO {$this->table} {$columns} VALUES " . implode(',', $question_marks);
        $pdo = $this->db->prepare($sql);

        return $pdo->execute($insert_values) ? true : $pdo->errorInfo()[2];
    }

    public function updateOtherRelatedData($data = []) {
        $exes = [];

        $sql = "UPDATE {$this->table} SET ";

        $keys = array_keys($data[0]);
        $klen = count($keys);
        $i = 1;
        foreach ($keys as $key) {
            if ($key !== 'PK' && $key !== 'SISN') {
                $sql .= $key . '= :' . $key;
                $sql .= $klen === $i ? ' ' : ', ';
            }
            $i++;
        }

        $sql .= 'WHERE SISN = :PK';

        $pdo = $this->db->prepare($sql);

        foreach ($data as $values) {
            foreach ($values as $key => $value) {
                if ($key === 'SISN') {
                    $exes[':PK'] = $value;
                } else {
                    $exes[':' . $key] = $value;
                }
            }

            if (!$pdo->execute($exes)) {
                return $pdo->errorInfo()[2];
            }
        }

        return true;
    }

    public function updateRelatedData($data = []) {
        $exes = [];

        $sql = "UPDATE {$this->table} SET ";

        $keys = array_keys($data[0]);
        $klen = count($keys);
        $i = 1;
        foreach ($keys as $key) {
            if ($key !== 'PK') {
                $sql .= $key . ' = :' . $key;
                $sql .= $klen === $i ? ' ' : ', ';
            }
            $i++;
        }

        $sql .= 'WHERE ' . $this->getPkColumnName() . ' = :PK';

        $pdo = $this->db->prepare($sql);

        foreach ($data as $values) {
            foreach ($values as $key => $value) {
                $exes[':' . $key] = $value;
            }

            if (!$pdo->execute($exes)) {
                return $pdo->errorInfo()[2];
            }
        }

        return true;
    }

    public function getCountry($country = null) {
        $exes = [];

        $pdo = $this->db->prepare("SELECT ORIGCTY,REGION FROM country_code WHERE NAME = :NAME LIMIT 1");
        $exes[':NAME'] = $country;

        $pdo->setFetchMode(PDO::FETCH_ASSOC);

        return $pdo->execute($exes) ? $pdo->fetch() : $pdo->errorInfo()[2];
    }

    public function countRow($filters = []) {
        $pk = $this->getPkColumnName();

        $sql = "SELECT COUNT(DISTINCT " . array_map([$this, "columnWithTable"], [$pk])[0] . ") AS total FROM {$this->table}_manager ";
        $exes = [];

        if ($this->table === 'seeddist' && count($filters) > 0) {
            $sql .= "LEFT JOIN detail ON {$this->table}_manager.IDNO = detail.IDNO LEFT JOIN crop ON detail.CROP = crop.CROP ";
        }

        if (count($filters) > 0) {
            $this->appendFilters($filters, $sql, $exes);
        }

        $pdo = $this->db->prepare($sql);
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        $total = $pdo->fetch();

        return $total['total'];
    }

    public function getList($column = null, $filters = [], $table = null) {
        $exes = [];
        $sql = "SELECT DISTINCT {$column} AS lists FROM " . ($table === null ? "{$this->table}_manager " : "{$table} ");

        if (count($filters) > 0) {
            $this->appendFilters($filters, $sql, $exes);
        }

        $this->appendOrders([$column => ['ASC']], $sql);

        $pdo = $this->db->prepare($sql);
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        return $pdo->fetchAll(PDO::FETCH_COLUMN);
    }

    public function getFullList($filters = []) {
        $exes = [];

        $len = count($filters);
        switch ($len) {
            case 0:
                $sql = "SELECT DISTINCT FAMILY FROM passport_family_genus ";
                break;
            case 1:
                $sql = "SELECT DISTINCT GENUS FROM passport_family_genus WHERE ";
                break;
            case 2:
                $sql = "SELECT DISTINCT SPECIES FROM passport_family_genus WHERE ";
                break;
            case 3:
                $sql = "SELECT DISTINCT SUBTAXA FROM passport_family_genus WHERE ";
                break;
        }

        if ($len > 0) {
            $i = 1;
            foreach ($filters as $key => $value) {
                $sql .= $key . ' = :' . $key;
                $exes[':' . $key] = $value;
                $sql .= $len !== $i ? ' AND ' : '';
                $i++;
            }
        }

        $pdo = $this->db->prepare($sql);
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        return $pdo->fetchAll();
    }

    private function appendFilters($filters = [], &$sql, &$exes) {
        $healthy = array(" ", "(", ")", ",", "~");
        $yummy = array("[[.space.]]", "[[.left-parenthesis.]]", "[[.right-parenthesis.]]", "[[.comma.]]", "[[.tilde.]]");

        $specialFilterColumn = ['FRCOL_MAT', 'FRSHP', 'FRPUNG', 'EXCOLMF', 'PREDO', 'DISSTA', 'GENUS', 'SPECIES', 'SUBTAXA', 'COUNTRY', 'STATUS', 'CLASSIFICATION', 'CLASS', 'CROP'];
        $subTablesql = ['CLASS' => 'crop', 'CROP' => 'detail', 'GENUS' => 'detail', 'SPECIES' => 'detail', 'SUBTAXA' => 'detail', 'IDNO' => 'seeddist_manager'];

        $sql .= "WHERE ";
        $i = 1;
        $len = count($filters);
        foreach ($filters as $key => $values) {
            $j = count($values);
            switch ($key) {
                case 'TEXT':
                    $NOTES = '';
                    $ANNOTT = '';
                    $DONO = '';
                    foreach ($values as $indexs => $value) {
                        $NOTES .= $indexs == $j - 1 ? str_replace($healthy, $yummy, $value) : str_replace($healthy, $yummy, $value) . '|';
                        $ANNOTT .= $indexs == $j - 1 ? str_replace($healthy, $yummy, $value) : str_replace($healthy, $yummy, $value) . '|';
                        $DONO .= $indexs == $j - 1 ? str_replace($healthy, $yummy, $value) : str_replace($healthy, $yummy, $value) . '|';
                    }
                    $exes[':NOTES'] = $NOTES;
                    $exes[':ANNOTT'] = $ANNOTT;
                    $exes[':DONO'] = $DONO;
                    $sql .= "(NOTES REGEXP :NOTES OR ANNOTT REGEXP :ANNOTT OR DONO REGEXP :DONO) ";
                    break;
                case 'SHIP_DATE':
                    foreach ($values as $indexs => $value) {
                        $dates = explode('~', $value);
                        $sql .= $indexs == 0 ? '(' : '';
                        $sql .= 'seeddist_manager.' . (count($dates) === 2 ? $key . " BETWEEN '" . $dates[0] . "' AND '" . $dates[1] : $key . " = '" . $dates[0]) . "' ";
                        $sql .= $indexs == $j - 1 ? ') ' : 'OR ';
                    }
                    break;
                default :
                    $sql .= ((array_key_exists($key, $subTablesql) && $this->table === 'seeddist') ? $subTablesql[$key] . '.' . $key : $key) . ' REGEXP :' . $key . ' ';

                    $$key = '';
                    foreach ($values as $indexs => $value) {
                        if (!in_array($key, $specialFilterColumn)) {
                            $$key .= $indexs == $j - 1 ? str_replace($healthy, $yummy, $value) : str_replace($healthy, $yummy, $value) . '|';
                        } else {
                            $$key .= $indexs == $j - 1 ? '^(' . str_replace($healthy, $yummy, $value) . ')$' : '^(' . str_replace($healthy, $yummy, $value) . ')$' . '|';
                        }
                    }

                    $exes[':' . $key] = $$key;
                    break;
            }

            $sql .= $i != $len ? "AND " : "";
            $i++;
        }
    }

    private function appendOrders($orders = [], &$sql) {
        $sql .="ORDER BY ";
        $i = 1;
        $len = count($orders);
        foreach ($orders as $key => $value) {
            $sql .= $key . " " . $value[0];
            $sql .= $i != $len ? ", " : "";
            $i++;
        }
    }

    private function placeholders($text, $count = 0, $separator = ",") {
        $result = array();
        if ($count > 0) {
            for ($x = 0; $x < $count; $x++) {
                $result[] = $text;
            }
        }

        return implode($separator, $result);
    }

}
