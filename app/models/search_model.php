<?php

class Search_Model extends Model {

    public $table = null;

    function __construct() {
        parent::__construct();
    }

    public function fetchRow($id) {
        $exes = [];

        switch ($this->table) {
            case 'passport':
                $pdo = $this->db->prepare("SELECT * FROM {$this->table}_view WHERE VINO = :VINO LIMIT 1");
                $exes[':VINO'] = $id;
                break;
            default :
                $pdo = $this->db->prepare("SELECT * FROM {$this->table}_view WHERE IDNO = :IDNO LIMIT 1");
                $exes[':IDNO'] = $id;
                break;
        }

        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        if ($this->table === 'brassica') {
            $data = $pdo->fetch();

            $pdo = $this->db->prepare("SELECT * FROM {$this->table}_view_second WHERE IDNO = :IDNO LIMIT 1");

            $pdo->setFetchMode(PDO::FETCH_ASSOC);
            $pdo->execute($exes);

            $data += $pdo->fetch();

            return $data;
        }

        return $pdo->fetch();
    }

    public function fetchOffsetRow($offset = 1, $limitRow = 20, $filters = [], $orders = []) {
        $index = ($offset - 1) * $limitRow;

        $sql = "SELECT * FROM {$this->table}_list ";
        $exes = [];

        if (count($filters) > 0) {
            $this->appendFilters($filters, $sql, $exes);
        }

        if (count($orders) > 0) {
            $this->appendOrders($orders, $sql);
        }

        $sql .= " LIMIT {$index},{$limitRow} ";        

        $pdo = $this->db->prepare($sql);
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        return $pdo->fetchAll();
    }

    public function countRow($filters = []) {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table}_list ";
        $exes = [];

        if (count($filters) > 0) {
            $this->appendFilters($filters, $sql, $exes);
        }

        $pdo = $this->db->prepare($sql);
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        $total = $pdo->fetch();

        return $total['total'];
    }

    public function getList($column = null, $filters = []) {
        $exes = [];
        $sql = "SELECT {$column} FROM {$this->table}_list ";

        if (count($filters) > 0) {
            $this->appendFilters($filters, $sql, $exes);
        }

        $sql .= " GROUP BY {$column} ";

        $this->appendOrders([$column => ['ASC']], $sql);

        $pdo = $this->db->prepare($sql);
        $pdo->setFetchMode(PDO::FETCH_ASSOC);
        $pdo->execute($exes);

        return $pdo->fetchAll(PDO::FETCH_COLUMN);
    }

    public function getMultiList($columns = null, $filters = []) {
        $exes = [];
        $sql = "SELECT " . join(', ', $columns) . " FROM {$this->table}_list ";

        if (count($filters) > 0) {
            $this->appendFilters($filters, $sql, $exes);
        }

        $sql .= " GROUP BY " . join(', ', $columns);

        $pdo = $this->db->prepare($sql);
        $pdo->execute($exes);

        return $pdo->fetchAll(PDO::FETCH_ASSOC);
    }

    private function appendFilters($filters = [], &$sql, &$exes) {
        $healthy = array(" ", "(", ")", ",", "~");
        $yummy = array("[[.space.]]", "[[.left-parenthesis.]]", "[[.right-parenthesis.]]", "[[.comma.]]", "[[.tilde.]]");

        $specialFilterColumn = ['DRYMAT', 'SUGAR', 'COLORVAL', 'LIPID', 'CAPSAI', 'PH', 'SSOLIDS', 'ACIDITY', 'TSOLIDS', 'CAROTENE', 'FIBER', 'VITA', 'VITC', 'ASA', 'TP', 'MT', 'DPPH', 'OIL', 'PROTEIN', 'STARCH'];
        $precisionColumn = [ 'DISSTA', 'GENUS', 'SPECIES', 'SUBTAXA', 'COUNTRY'];

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
                case 'REMARKS':
                    $sql .= $key . " REGEXP  :" . $key . " ";
                    $$key = '';

                    foreach ($values as $indexs => $value) {
                        $$key .= $indexs == $j - 1 ? str_replace($healthy, $yummy, $value) : str_replace($healthy, $yummy, $value) . '|';
                    }

                    $exes[':' . $key] = $$key;
                    break;
                default :
                    if ($this->table == 'evaluation' && in_array($key, $specialFilterColumn)) {
                        foreach ($values as $indexs => $value) {
                            $sql .= $indexs == $j - 1 ? $key . ' ' . $value : $key . ' ' . $value . ' OR ';
                        }
                    } else {
                        $sql .= $key . " REGEXP  :" . $key . " ";
                        $$key = '';

                        foreach ($values as $indexs => $value) {
                            if (!in_array($key, $precisionColumn)) {
                                $$key .= $indexs == $j - 1 ? str_replace($healthy, $yummy, $value) : str_replace($healthy, $yummy, $value) . '|';
                            } else {
                                $$key .= $indexs == $j - 1 ? '^(' . str_replace($healthy, $yummy, $value) . ')$' : '^(' . str_replace($healthy, $yummy, $value) . ')$' . '|';
                            }
                        }

                        $exes[':' . $key] = $$key;
                    }
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

}
