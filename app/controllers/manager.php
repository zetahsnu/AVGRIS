<?php

class Manager extends Controller {

    private $tables = [
        'Passport data' => [
            'passport'
        ],
        'Characterization data' => [
            'abelmoschus',
            'allium',
            'amaranthus',
            'ampelopsis',
            'anethum',
            'artemisia',
            'basella',
            'benincasa',
            'beta',
            'bidens',
            'brassica',
            'cajanus',
            'capsicum',
            'carthamus',
            'cassia',
            'celosia',
            'chrysanthemum',
            'cicer',
            'cleome',
            'coccinia',
            'coix',
            'corchorus',
            'cosmos',
            'cucumis',
            'cucurbita',
            'eruca',
            'eryngium',
            'foeniculum',
            'glycine',
            'hibiscus',
            'ipomoea',
            'lablab',
            'lactuca',
            'lagenaria',
            'luffa',
            'macrotyloma',
            'malva',
            'mentha',
            'momordica',
            'moringa',
            'ocimum',
            'pastinaca',
            'phaseolus_lunatus',
            'phaseolus_spp',
            'phytolacca',
            'pisum',
            'psophocarpus',
            'sesbania',
            'solanum_eggplant',
            'solanum_tomato',
            'spilanthes',
            'spinacia',
            'talinum',
            'trichosanthes',
            'vigna_angularis',
            'vigna_spp',
            'vigna_unguiculata'
        ],
        'Evaluation data' => [
            'evaluation'
        ],
        'Seed inventory' => [
            'seedinventory'
        ],
        'Seed distribution' => [
            'seeddist'
        ]
    ];

    public function __construct() {
        parent::__construct();
    }

    public function index() {
        if (SESSION::get('isLogin')) {
            $user = SESSION::get('user');

            $this->load('manager_model');

            switch ($user['JURISDICTION']) {
                case '0':
                    $data['tables'] = $this->tables;
                    break;
                case '1':
                    $data['tables']['Characterization data'] = explode(',', $user['TABLES']);
                    break;
                case '2':
                    $data['tables']['Seed distribution'] = [$user['TABLES']];
                    break;
                case '3':
                    $data['tables']['Seed inventory'] = [$user['TABLES']];
                    break;
            }

            foreach ($data['tables'] as $category => $tables) {
                foreach ($tables as $table) {
                    $this->model->table = $table;
                    $data['totals'][$category][$table] = $this->model->countRow();
                }
            }

            $this->view->render(__CLASS__, __FUNCTION__, $data);
        } else {
            $this->view->render(__CLASS__, 'login');
        }
    }

    public function getPage($page = 'index') {
        $this->checkticket('RequestPage');

        $data = ['title' => $page];
        $html = [];

        switch ($page) {
            case 'index':
                $data['part'] = true;
                $html['html'] = $this->view->render(__CLASS__, 'dashboard/' . $page, $data, true);
                break;
            case 'assign':
                $this->load('manager_model');

                $data['peoples'] = $this->model->getPeoples(1);
                $data['characterization'] = $this->tables['Characterization data'];

                $html['html'] = $this->view->render(__CLASS__, 'people/' . $page, $data, true);
                break;
            case 'resetP':
                $this->load('manager_model');

                $data['title'] = 'Reset Password';
                $data['peoples'] = $this->model->getPeoples(0, '>');

                $html['html'] = $this->view->render(__CLASS__, 'people/' . $page, $data, true);
                break;
            case 'changeP':
                $data['title'] = 'Change Password';

                $html['html'] = $this->view->render(__CLASS__, 'profile/' . $page, $data, true);
                break;
            default :
                $this->load('manager_model');
                $this->model->table = $page;

                if ($page !== 'seedinventory') {
                    $data['country'] = array_filter($this->model->getList('country'));
                }

                switch ($page) {
                    case 'passport':
                        $data['category'] = 'Passport data';
                        $data['genus'] = array_filter($this->model->getList('genus'));
                        $data['full_family'] = $this->model->getFullList();
                        break;
                    case 'evaluation':
                        $data['category'] = 'Evaluation data';
                        $data['genus'] = array_filter($this->model->getList('genus'));
                        break;
                    case 'seedinventory':
                        $data['category'] = 'Seed inventory';
                        $data['genus'] = array_filter($this->model->getList('genus'));
                        break;
                    case 'seeddist':
                        $data['category'] = 'Seed distribution';
                        $data['genus'] = array_filter($this->model->getList('genus', [], 'detail'));
                        $data['classification'] = array_filter($this->model->getList('classification'));
                        $data['crop'] = array_filter($this->model->getList('crop', [], 'detail'));
                        $data['class'] = array_filter($this->model->getList('class', [], 'class_crop'));
                        $data['class_name'] = array_filter($this->model->getList('class_name', [], 'class_crop'));
                        break;
                    default:
                        $data['category'] = 'Characterization data';
                        $data['species'] = array_filter($this->model->getList('species'));
                        break;
                }

                $related = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/related/' . $page . '.json'));

                if (isset($related->related)) {
                    foreach ($related->related as $value) {
                        $data['related'][strtoupper($value)] = $this->model->getColumnRelatedData($value);
                    }

                    ksort($data['related']);
                }

                if (isset($related->other_related)) {
                    foreach ($related->other_related as $value) {
                        $data['other_related'][strtoupper($value)] = $this->model->getOtherRelatedData($value);
                    }
                }

                if (isset($related->list)) {
                    foreach ($related->list as $value) {
                        $data['list'][strtoupper($value)] = $this->model->getOtherRelatedData($value);
                    }
                }

                if (isset($related->related_subtable)) {
                    $data['scolumns'] = array_filter($this->model->getColumns($related->related_subtable[0]), function($var) {
                        $skips = ['IDNO', 'VINO', 'SISN'];
                        return !in_array($var, $skips);
                    });

                    $data['related_subtable'] = $related->related_subtable[0];
                    $data['titles'] = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/stable/' . $related->related_subtable[0] . '.json'), true);

                    if (isset($related->subtable_related)) {
                        foreach ($related->subtable_related as $value) {
                            $data['subtable_related'][] = strtoupper($value);
                        }
                    }
                }

                //檢查過濾選項
                $filters = filter_has_var(INPUT_COOKIE, $page . 'filters_manager') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, $page . 'filters_manager'))) : [];
                //檢查排序選項
                $orders = filter_has_var(INPUT_COOKIE, $page . 'orders_manager') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, $page . 'orders_manager'))) : [];

                //每頁顯示，預設20
                $data['limitRow'] = filter_has_var(INPUT_COOKIE, 'manager_perPageRow') ? filter_input(INPUT_COOKIE, 'manager_perPageRow') : 20;

                $data['total'] = $this->model->countRow($filters);
                $data['columns'] = $this->model->getColumns();
                $data['offset'] = 1;
                $data['data'] = $this->model->fetchOffsetRow($data['offset'], $data['limitRow'], $filters, $orders);

                $html['html'] = $this->view->render(__CLASS__, 'db/dbpage', $data, true);
                break;
        }

        echo json_encode($html);
    }

    public function getDashboard() {
        $analytics = Analysis::getService();
        $profile = Analysis::getFirstProfileId($analytics);

        $results = Analysis::getSessions($analytics, $profile);

        $data['total_sessions'] = $results->totalsForAllResults['ga:sessions'];

        $results = Analysis::getUsers($analytics, $profile);

        $data['total_users'] = $results->totalsForAllResults['ga:users'];

        $results = Analysis::getWithMonth($analytics, $profile);

        $data['group_month'] = $results['rows'];

        $results = Analysis::getWithDay($analytics, $profile);

        $data['group_day'] = $results['rows'];

        echo json_encode($data, JSON_NUMERIC_CHECK);
    }

    public function getInvMT() {
        $this->checkticket('MT');

        $MT = filter_input(INPUT_POST, 'MT', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        $this->load('manager_model');
        $this->model->table = 'seedinventory';

        $data['live_total'] = $this->model->getInvMT($MT[0], $MT[1]);

        echo json_encode($data);
    }

    public function getRelatedData($page) {
        $this->checkticket('RelatedData');

        $data = filter_input(INPUT_POST, 'RelatedData', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        $this->load('manager_model');

        switch ($data['group']) {
            case 'ori':
                $table = $page . '_' . $data['data'];
                break;
            case 'sub':
            case 'ore':
            case 'li':
                $table = $data['data'];
                break;
        }

        $this->model->table = $table;

        $rdata['data'] = $this->model->getRelatedData();
        $rdata['pk'] = $this->model->getPkColumnName();
        $rdata['rcolumns'] = $this->model->getColumns($table);

        $html['rhead'] = $this->view->render(__CLASS__, 'db/rhead', $rdata, true);
        $html['rbody'] = $this->view->render(__CLASS__, 'db/rbody', $rdata, true);

        echo json_encode($html);
    }

    public function updateRelatedData($page = null) {
        $this->checkticket('RelatedData');

        $data = filter_input(INPUT_POST, 'RelatedData', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        switch ($data['group']) {
            case 'ori':
                $table = $page . '_' . $data['column'];
                break;
            case 'sub':
            case 'ore':
            case 'li':
                $table = $data['column'];
                break;
        }

        $this->load('manager_model');
        $this->model->table = $table;

        if (isset($data['add']) && count($data['add']) > 0) {
            if (!is_bool($result = $this->model->insertRealtedData($data['add']))) {
                core\Error::setError($result);
            }
        }

        if (isset($data['edit']) && count($data['edit']) > 0) {
            if (!is_bool($result = $this->model->updateRelatedData($data['edit']))) {
                core\Error::setError($result);
            }
        }

        if (isset($data['delete']) && count($data['delete']) > 0) {
            if (!is_bool($result = $this->model->deleteRelatedData($data['delete']))) {
                core\Error::setError($result);
            }
        }

        if (count(core\Error::getErrors()) > 0) {
            $error['error'] = core\Error::getErrors();

            echo json_encode($error);
        } else {
            echo json_encode(['success' => true]);
        }
    }

    public function getFullList() {
        $this->checkticket('FullList');

        $filters = filter_input(INPUT_POST, 'FullList', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        $this->load('manager_model');

        $data['options'] = $this->model->getFullList($filters);

        echo json_encode($data);
    }

    public function getOtherRelatedTable($page = null) {
        $this->checkticket('OtherRelatedTable');

        $data = filter_input(INPUT_POST, 'OtherRelatedTable', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        $this->load('manager_model');

        $related = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/related/' . $page . '.json'));

        if (isset($data['view']) && $data['view'] == true) {
            if (isset($related->related_subtable)) {
                $Odata['view'] = true;
                $Odata['scolumns'] = array_filter($this->model->getColumns($related->related_subtable[0]), function($var) {
                    $skips = ['IDNO', 'VINO', 'SISN'];
                    return !in_array($var, $skips);
                });

                $Odata['data'] = $this->model->getOtherRelatedData($related->related_subtable[0], $data['pk']);
                $Odata['titles'] = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/stable/' . $related->related_subtable[0] . '.json'), true);
                $html['total'] = count($Odata['data']);
            }

            if (count($Odata['data']) > 0) {
                $html['html_head'] = $this->view->render(__CLASS__, 'db/ohead', $Odata, true);
            }

            $html['html_body'] = $this->view->render(__CLASS__, 'db/obody', $Odata, true);
        } else {
            if (isset($related->related_subtable)) {
                $Odata['scolumns'] = array_filter($this->model->getColumns($related->related_subtable[0]), function($var) {
                    $skips = ['IDNO', 'VINO', 'SISN'];
                    return !in_array($var, $skips);
                });

                $Odata['data'] = $this->model->getOtherRelatedData($related->related_subtable[0], $data['pk']);
                $Odata['titles'] = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/stable/' . $related->related_subtable[0] . '.json'), true);
                $html['total'] = count($Odata['data']);
            }

            if (isset($related->subtable_related)) {
                $Odata['subtable_related']['CROP'] = $this->model->getSubtableColumnRelatedData($related->subtable_related[0]);
            }

            $html['html'] = $this->view->render(__CLASS__, 'db/obody', $Odata, true);
        }

        echo json_encode($html);
    }

    public function getSubtableAddTr($page = null) {
        $related = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/related/' . $page . '.json'));

        $this->load('manager_model');

        if (isset($related->related_subtable)) {
            $Odata['scolumns'] = array_filter($this->model->getColumns($related->related_subtable[0]), function($var) {
                $skips = ['IDNO', 'VINO', 'SISN'];
                return !in_array($var, $skips);
            });

            $Odata['titles'] = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/stable/' . $related->related_subtable[0] . '.json'), true);
        }

        if (isset($related->subtable_related)) {
            $Odata['subtable_related']['CROP'] = $this->model->getSubtableColumnRelatedData($related->subtable_related[0]);
        }

        $html['html'] = $this->view->render(__CLASS__, 'db/obody', $Odata, true);

        echo json_encode($html);
    }

    public function getCountry() {
        $this->checkticket('Country');

        $country = filter_input(INPUT_POST, 'Country');

        $this->load('manager_model');

        if (is_array($result = $this->model->getCountry($country))) {
            $data['country'] = $result;
        } else {
            $data['error'] = $result;
        }

        echo json_encode($data);
    }

    public function updateUserTables($id = null) {
        $this->checkticket('UserTables');

        $tables = filter_input(INPUT_POST, 'UserTables');

        $updateTables = explode(',', $tables);

        if (count(array_intersect($updateTables, $this->tables['Characterization data'])) == count($updateTables)) {
            $this->load('manager_model');

            if (!is_bool($result = $this->model->updateUserTables($id, $tables))) {
                $data['error'] = $result;
            }
        } else {
            $data['error'] = 'Operation fail';
        }

        echo json_encode(isset($data['error']) ? $data : ['success' => true]);
    }

    public function resetUserPassword($id = null) {
        $this->checkticket('UserPassword');

        $password = filter_input(INPUT_POST, 'UserPassword');

        $this->load('manager_model');

        if (!is_bool($result = $this->model->changeUserPassword($id, $password))) {
            $data['error'] = $result;
        }

        echo json_encode(isset($data['error']) ? $data : ['success' => true]);
    }

    public function changeUserPassword() {
        $this->checkticket('UserPassword');

        $user = SESSION::get('user');

        $id = $user['ID'];
        $username = $user['USERNAME'];

        $oldpas = filter_input(INPUT_POST, 'oldpas');
        $newpas = filter_input(INPUT_POST, 'newpas');

        $this->load('manager_model');

        if (!is_bool($result = $this->model->checkUser($username, $oldpas)) && $result !== true) {
            echo json_encode(['result' => false]);
            exit();
        }

        if (is_bool($result = $this->model->changeUserPassword($id, $newpas))) {
            SESSION::destroy();
            echo json_encode(['result' => true]);
        } else {
            echo json_encode(['error' => $result]);
        }
    }

    public function getTableData($offset = 1) {
        $this->checkticket('submit') && $this->checkticket('requestTable');

        $table = filter_input(INPUT_POST, 'requestTable');

        $this->load('manager_model');
        $this->model->table = $table;

        $related = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/related/' . $table . '.json'));

        if (isset($related->related_subtable)) {
            $data['related_subtable'] = $related->related_subtable[0];
        }

        //檢查過濾選項
        $filters = filter_has_var(INPUT_COOKIE, $table . 'filters_manager') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, $table . 'filters_manager'))) : [];
        //檢查排序選項
        $orders = filter_has_var(INPUT_COOKIE, $table . 'orders_manager') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, $table . 'orders_manager'))) : [];

        //每頁顯示，預設20
        $data['limitRow'] = filter_has_var(INPUT_COOKIE, 'manager_perPageRow') ? filter_input(INPUT_COOKIE, 'manager_perPageRow') : 20;

        //offset值
        $offset = is_numeric($offset) && $offset > 0 ? $offset : 1;

        $data['total'] = $this->model->countRow($filters);
        $data['columns'] = $this->model->getColumns();
        $data['offset'] = $offset > ceil($data['total'] / $data['limitRow']) ? ceil($data['total'] / $data['limitRow']) == 0 ? 1 : ceil($data['total'] / $data['limitRow']) : $offset;
        $data['data'] = $this->model->fetchOffsetRow($data['offset'], $data['limitRow'], $filters, $orders);

        $html['total'] = $data['total'];
        $html['offset'] = $data['offset'];
        $html['html'] = $this->view->render(__CLASS__, 'db/body', $data, true);

        echo json_encode($html);
    }

    public function export($page) {
        //設定記憶體大小
        ini_set('memory_limit', MEMORY_LIMIT_EXPORT);
        set_time_limit(0);

        $input = file_get_contents("php://input");

        $columns = json_decode($input);

        //檢查過濾選項
        $filters = filter_has_var(INPUT_COOKIE, $page . 'filters_manager') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, $page . 'filters_manager'))) : [];
        //檢查排序選項
        $orders = filter_has_var(INPUT_COOKIE, $page . 'orders_manager') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, $page . 'orders_manager'))) : [];

        $this->load('manager_model');
        $this->model->table = $page;

        $data = $this->model->exportRow($columns, $filters, $orders);

        $user = SESSION::get('user');

        // filename for download
        $filename = $page . "_" . date('Ymd') . ".xlsx";

        header("Content-Disposition: attachment; filename=\"{$filename}\"");
        header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        header("Cache-Control: max-age=0");

        array_unshift($data, $columns);

        $writer = new XLSXWriter();
        $writer->setAuthor($user['USERNAME']);
        $writer->writeSheet($data, $page . ' - exported');

        $related = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/related/' . $page . '.json'));

        if (isset($related->related_subtable)) {
            $table = $related->related_subtable[0];

            $ids = [];
            $pkindex = array_search('IDNO', $columns);

            $subColumns = $this->model->getColumns($table);

            foreach ($data as $index => $value) {
                if ($index != 0) {
                    $ids[] = $value[$pkindex];
                }
            }

            $subData = $this->model->exportSubRow($table, $ids);

            if (count($subData) > 0) {
                array_unshift($subData, $subColumns);

                $writer->writeSheet($subData, $table . ' - exported');
            }
        }

        $writer->writeToStdOut();

        die();
    }

    public function import($page) {
        //TODO:去掉空白項
        $this->checkticket('import');

        $data = filter_input(INPUT_POST, 'import', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        $temp_folder = __DIR__ . '/../temp/'; //upload directory ends with / (slash)

        ini_set('memory_limit', MEMORY_LIMIT_IMPORT);
        set_time_limit(0);

        $cacheMethod = PHPExcel_CachedObjectStorageFactory:: cache_to_phpTemp;
        $cacheSettings = array(' memoryCacheSize ' => '20MB');
        PHPExcel_Settings::setCacheStorageMethod($cacheMethod, $cacheSettings);

        $objReader = PHPExcel_IOFactory::createReader('Excel2007');
        $objReader->setReadDataOnly(true);
        $objPHPExcel = $objReader->load($temp_folder . $data['tempname']);

        if ($objPHPExcel) {
            $objWorksheet = $objPHPExcel->getActiveSheet(0);

            $highestRow = $objWorksheet->getHighestRow();
            $highestColumn = $objWorksheet->getHighestColumn();
            $highestColumnIndex = PHPExcel_Cell::columnIndexFromString($highestColumn);

            $keys = [];

            for ($col = 0; $col <= $highestColumnIndex; $col++) {
                if ($objWorksheet->getCellByColumnAndRow($col, 1)->getValue() !== null) {
                    $keys[$col] = $objWorksheet->getCellByColumnAndRow($col, 1)->getValue();
                } else {
                    break;
                }
            }

            $this->load('manager_model');
            $columns = $this->model->getColumns($page);

            foreach ($keys as $key => $value) {
                if (!in_array($value, $columns)) {
                    $data['error'][] = 'Column ' . $value . ' doesn\'t in the table: ' . $page;
                }
            }

            if (isset($data['error']) && count($data['error']) > 0) {
                echo json_encode($data);
            } else {
                $rows = [];
                $collen = count($keys);
                for ($row = 2; $row <= $highestRow; $row++) {
                    for ($col = 0; $col < $collen; $col++) {
                        $rows[($row - 2)][$keys[$col]] = trim($objWorksheet->getCellByColumnAndRow($col, $row)->getValue()) === '' ? null : trim($objWorksheet->getCellByColumnAndRow($col, $row)->getValue());
                    }

                    $row_keys = array_keys($rows[($row - 2)], '');

                    if (count($row_keys) == $collen) {
                        unset($rows[($row - 2)]);
                    }
                }

                if (count($rows) > 0) {

                    $this->model->table = $page;

                    if ($data['method'] === 'add') {
                        if (!is_bool($result = $this->model->insertTableData($rows))) {
                            $data['error'][] = $result;
                            echo json_encode($data);
                            exit();
                        }
                    } else if ($data['method'] === 'update') {
                        if (!is_bool($result = $this->model->updateTableData($rows))) {
                            $data['error'][] = $result;
                            echo json_encode($data);
                            exit();
                        }
                    }


                    $total = $this->model->countRow();
                }

                $related = json_decode(file_get_contents(__DIR__ . '/../views/manager/db/related/' . $page . '.json'));

                if (isset($related->related_subtable) && $objPHPExcel->getSheetCount() > 1) {
                    $table = $related->related_subtable[0];

                    $objPHPExcel->setActiveSheetIndex(1);
                    $objWorksheet = $objPHPExcel->getActiveSheet(1);

                    $highestRow = $objWorksheet->getHighestRow();
                    $highestColumn = $objWorksheet->getHighestColumn();
                    $highestColumnIndex = PHPExcel_Cell::columnIndexFromString($highestColumn);

                    $keys = [];

                    for ($col = 0; $col <= $highestColumnIndex; $col++) {
                        if ($objWorksheet->getCellByColumnAndRow($col, 1)->getValue() !== null) {
                            $keys[$col] = $objWorksheet->getCellByColumnAndRow($col, 1)->getValue();
                        } else {
                            break;
                        }
                    }

                    $columns = $this->model->getColumns($table);

                    foreach ($keys as $key => $value) {
                        if (!in_array($value, $columns)) {
                            $data['error'][] = 'Column ' . $value . ' doesn\'t in the table: ' . $table;
                        }
                    }

                    if (isset($data['error']) && count($data['error']) > 0) {
                        echo json_encode($data);
                    } else {

                        $rows = [];
                        $collen = count($keys);
                        for ($row = 2; $row <= $highestRow; $row++) {
                            for ($col = 0; $col < $collen; $col++) {
                                $rows[($row - 2)][$keys[$col]] = $objWorksheet->getCellByColumnAndRow($col, $row)->getValue();
                            }
                        }

                        $this->model->table = $table;

                        if ($data['method'] === 'add') {
                            $arr = [];

                            foreach ($rows as $key => $item) {
                                $arr[$item['IDNO']][] = $item;
                            }

                            ksort($arr, SORT_NUMERIC);

                            foreach ($arr as $key => $value) {
                                $ivalue = count($value);
                                for ($i = 0; $i < $ivalue; $i++) {
                                    unset($value[$i]['IDNO']);
                                    unset($value[$i]['SISN']);
                                }

                                if (!is_bool($result = $this->model->insertOtherRelatedData($value, ['IDNO' => $key]))) {
                                    $data['error'][] = $result;
                                    echo json_encode($data);
                                    exit();
                                }
                            }
                        } else if ($data['method'] === 'update') {
                            if (!is_bool($result = $this->model->updateOtherRelatedData($rows))) {
                                $data['error'][] = $result;
                                echo json_encode($data);
                                exit();
                            }
                        }
                    }
                }

                echo json_encode(isset($data['error']) ? $data : ['success' => true, 'total' => isset($total) ? $total : 0]);
            }
        } else {
            echo json_encode(['error' => "Can't Load File"]);
        }
    }

    public function excelUploader($page) {
        $temp_folder = __DIR__ . '/../temp/'; //upload directory ends with / (slash)

        if (isset($_POST) && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {

            // check $_FILES['ImageFile'] not empty
            if (!isset($_FILES['impot_file']) || !is_uploaded_file($_FILES['impot_file']['tmp_name'])) {
                die('Excel file is Missing!'); // output error when above checks fail.
            }

            //get uploaded file info before we proceed
            $import_temp = $_FILES['impot_file']['tmp_name']; //file temp
            $import_type = $_FILES['impot_file']['type'];

            switch ($import_type) {
                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    $new_file_name = $page . '_' . time() . '.xlsx';
                    if (move_uploaded_file($import_temp, $temp_folder . $new_file_name)) {
                        echo json_encode(['success' => 'true', 'temp_name' => $new_file_name]);
                    } else {
                        echo json_encode(['error' => 'Upload error!']);
                    }
                    break;
                default:
                    echo json_encode(['error' => 'Upload error!']);
                    break;
            }
        } else {
            echo json_encode(['error' => 'Upload error!']);
        }
    }

    /**
     * 回傳單一個欄位的值
     * @param type $table
     * @param type $column
     */
    public function listColumn($table, $column) {
        $this->checkticket('filters');

        $this->load('manager_model');
        $this->model->table = $table;

        $filters = filter_input(INPUT_POST, 'filters');
        $filters = explode(',', $filters);
        $filtersGroup = $this->toGroup($filters);

        $data['data'] = array_filter($table === 'seeddist' ? $this->model->getList($column, $filtersGroup, 'detail') : $this->model->getList($column, $filtersGroup));

        $data['data'] = $this->view->render(__CLASS__, 'db/filters/list', $data, true);

        echo json_encode($data);
    }

    public function checkPhotoExist($char, $idno) {
        echo json_encode(['status' => file_exists(__DIR__ . '/../pictures/' . $char . '/' . $idno . '.jpg') ? true : false]);
    }

    public function login() {
        $this->checkticket('login');

        $user_data = filter_input(INPUT_POST, 'login', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        $this->load('manager_model');

        if ($this->model->checkUser($user_data['username'], $user_data['password'])) {
            SESSION::set('isLogin', true);
            SESSION::set('user', $this->model->getUserInfo($user_data['username']));
            echo json_encode(['status' => true]);
        } else {
            echo json_encode(['status' => false]);
        }
    }

    public function logout() {
        $this->checkticket('logout');

        SESSION::destroy();

        echo json_encode(['status' => true]);
    }

    public function autoComplete($vino = null) {
        $this->checkticket('query');

        $vino = filter_input(INPUT_POST, 'query');

        $this->load('manager_model');
        $this->model->table = 'passport';

        $data['suggestions'] = $this->model->getVINO($vino);

        echo json_encode($data);
    }

    public function getPasInfo($vino = null) {
        if ($vino !== null) {
            $this->load('manager_model');
            $this->model->table = 'passport';

            $data['data'] = $this->model->getPasInfo($vino);

            echo json_encode($data);
        } else {
            echo json_encode(['error' => 'Don\'t input VINO']);
        }
    }

    public function updateTableData($page = null) {
        $this->checkticket('TableData');

        if ($page === null) {
            $error['error'] = 'Not assecpted to request data!';
            echo json_encode($error);
            exit();
        }

        $data = filter_input(INPUT_POST, 'TableData', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        $this->load('manager_model');
        $this->model->table = $page;

        if (isset($data['changed'])) {
            if (!is_bool($result = $this->model->updateTableData($data['changed']))) {
                $data['error'][] = $result;
            }
        }

        if (isset($data['pictureTempName'])) {
            if (file_exists(__DIR__ . '/../pictures/' . $page . '/' . $data['pk']['IDNO'] . '.jpg') && file_exists(__DIR__ . '/../pictures/' . $page . '/' . $data['pictureTempName'])) {
                unlink(__DIR__ . '/../pictures/' . $page . '/' . $data['pk']['IDNO'] . '.jpg');
                rename(__DIR__ . '/../pictures/' . $page . '/' . $data['pictureTempName'], __DIR__ . '/../pictures/' . $page . '/' . $data['pk']['IDNO'] . '.jpg');
            } else if (file_exists(__DIR__ . '/../pictures/' . $page . '/' . $data['pictureTempName'])) {
                rename(__DIR__ . '/../pictures/' . $page . '/' . $data['pictureTempName'], __DIR__ . '/../pictures/' . $page . '/' . $data['pk']['IDNO'] . '.jpg');
            }
        }

        if (isset($data['otherChanged'])) {
            $this->model->table = 'detail';

            if (isset($data['otherChanged']['delete'])) {
                if (!is_bool($result = $this->model->deleteOtherRelatedData($data['otherChanged']['delete']))) {
                    $data['error'][] = $result;
                }
            }

            if (isset($data['otherChanged']['add'])) {
                if (!is_bool($result = $this->model->insertOtherRelatedData($data['otherChanged']['add'], $data['otherChanged']['column']))) {
                    $data['error'][] = $result;
                }
            }

            if (isset($data['otherChanged']['edit'])) {
                if (!is_bool($result = $this->model->updateOtherRelatedData($data['otherChanged']['edit']))) {
                    $data['error'][] = $result;
                }
            }
        }

        echo json_encode(isset($data['error']) ? $data['error'] : ['success' => true]);
    }

    public function insertTableData($page = null) {
        $this->checkticket('TableData');

        if ($page === null) {
            $error['error'] = 'Not assecpted to request data!';
            echo json_encode($error);
            exit();
        }

        $data = filter_input(INPUT_POST, 'TableData', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        $this->load('manager_model');
        $this->model->table = $page;

        if (isset($data['changed'])) {
            $datas = [];

            if (!is_bool($result = $this->model->insertTableData($data['changed']))) {
                echo json_encode(['error' => $result]);
                exit();
            }

            if ($page !== 'passport' && $page !== 'seeddist') {
                $id = $this->model->getLastInsertId();
            } else {
                $id = $data['changed'][0][$data['pk']];
            }

            $datas['columns'] = $this->model->getColumns();
            $datas['data'][0] = $this->model->getDataFromID($data['pk'], $id);

            $html['html'] = $this->view->render(__CLASS__, 'db/body', $datas, true);
        }

        if (isset($data['pictureTempName'])) {
            if (file_exists(__DIR__ . '/../pictures/' . $page . '/' . $data['pictureTempName'])) {
                rename(__DIR__ . '/../pictures/' . $page . '/' . $data['pictureTempName'], __DIR__ . '/../pictures/' . $page . '/' . $id . '.jpg');
            }
        }

        if (isset($data['otherChanged'])) {
            $this->model->table = 'detail';

            if (isset($data['otherChanged']['add'])) {
                if (!is_bool($result = $this->model->insertOtherRelatedData($data['otherChanged']['add'], $data['otherChanged']['column']))) {
                    echo json_encode(['error' => $result]);
                    exit();
                }
            }
        }

        echo json_encode($html);
    }

    public function deleteTableData($page = null) {
        $this->checkticket('TableData');

        if ($page === null) {
            $error['error'] = 'Not assecpted to request data!';
            echo json_encode($error);
            exit();
        }

        $data = filter_input(INPUT_POST, 'TableData', FILTER_UNSAFE_RAW, FILTER_REQUIRE_ARRAY);

        if (isset($data)) {
            $this->load('manager_model');
            $this->model->table = $page;

            if (!is_bool($result = $this->model->deleteTableData(key($data), $data[key($data)]))) {
                $error['error'] = $result;
            }

            if (!isset($error['error'])) {
                foreach ($data[key($data)] as $value) {
                    if (file_exists(__DIR__ . '/../pictures/' . $page . '/' . $value . '.jpg')) {
                        unlink(__DIR__ . '/../pictures/' . $page . '/' . $value . '.jpg');
                    }
                }
            }
            echo json_encode(isset($error['error']) ? $error : ['result' => true]);
        } else {
            echo json_encode(['error' => 'Don\'t get any data']);
        }
    }

    public function deleteTempPicture($page) {
        $this->checkticket('tempname');

        if ($page === null) {
            $error['error'] = 'Not assecpted to request data!';
            echo json_encode($error);
            exit();
        }

        $name = filter_input(INPUT_POST, 'tempname');

        if (file_exists(__DIR__ . '/../pictures/' . $page . '/' . $name)) {
            unlink(__DIR__ . '/../pictures/' . $page . '/' . $name);

            foreach (glob(__DIR__ . '/../pictures/' . $page . '/' . 'temp_*') as $filename) {
                unlink($filename);
            }

            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'File don\'t exist']);
        }
    }

    public function imageUploader($char = null, $idno = null) {
        $max_image_width_size = 400; //Maximum image size (width)
        $max_image_height_size = 300; //Maximum image size (height)
        $destination_folder = __DIR__ . '/../pictures/' . $char . '/'; //upload directory ends with / (slash)
        $watermark_filename = __DIR__ . '/../../public/images/manager/db/pictures/watermark/Logo_Mark.png';
        $jpeg_quality = 90; //jpeg quality

        if (!file_exists($destination_folder)) {
            mkdir($destination_folder, 0777, true);
        }

        if (isset($_POST) && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {

            // check $_FILES['ImageFile'] not empty
            if (!isset($_FILES['image_file']) || !is_uploaded_file($_FILES['image_file']['tmp_name'])) {
                echo json_encode(['error' => 'Image file is Missing!']); // output error when above checks fail.
                exit();
            }

            //get uploaded file info before we proceed
            $image_name = $_FILES['image_file']['name']; //file name
            $image_size = $_FILES['image_file']['size']; //file size
            $image_temp = $_FILES['image_file']['tmp_name']; //file temp

            $image_size_info = getimagesize($image_temp); //gets image size info from valid image file

            if ($image_size_info) {
                $image_width = $image_size_info[0]; //image width
                $image_height = $image_size_info[1]; //image height
                $image_type = $image_size_info['mime']; //image type
            } else {
                echo json_encode(['error' => 'Make sure image file is valid!']);
                exit();
            }

            //switch statement below checks allowed image type 
            //as well as creates new image from given file 
            switch ($image_type) {
                case 'image/jpeg': case 'image/pjpeg':
                    $image_res = imagecreatefromjpeg($image_temp);
                    break;
                default:
                    $image_res = false;
            }

            if ($image_res) {
                //Get file extension and name to construct new file name 
                $image_info = pathinfo($image_name);
                $image_extension = strtolower($image_info["extension"]); //image extension
                //create a random name for new image (Eg: fileName_293749.jpg) ;
                $new_file_name = 'temp_' . time() . '.' . $image_extension;

                //folder path to save resized images and thumbnails
                $image_save_folder = $destination_folder . $new_file_name;

                //call normal_resize_image() function to proportionally resize image
                if ($this->normal_resize_image($image_res, $image_save_folder, $image_type, $max_image_width_size, $max_image_height_size, $image_width, $image_height, $jpeg_quality)) {

                    $this->watermark($image_save_folder, $watermark_filename, $image_save_folder);

                    /* We have succesfully resized and created thumbnail image
                      We can now output image to user's browser or store information in the database */
                    echo json_encode(['success' => true, 'tempfilename' => $new_file_name]);
                }

                imagedestroy($image_res); //freeup memory
            } else {
                echo json_encode(['error' => 'Not the right format.']);
            }
        } else {
            echo json_encode(['error' => 'Can\'t get file.']);
        }
    }

    private function cleanData(&$str) {
        $str = preg_replace("/\t/", "\\t", $str);
        $str = preg_replace("/\r?\n/", "\\n", $str);
        if (strstr($str, '"'))
            $str = '"' . str_replace('"', '""', $str) . '"';
    }

    private function normal_resize_image($source, $destination, $image_type, $max_width_size, $max_height_size, $image_width, $image_height, $quality) {

        if ($image_width <= 0 || $image_height <= 0) {
            return false;
        } //return false if nothing to resize
        //do not resize if image is smaller than max size
        if ($image_width <= $max_width_size && $image_height <= $max_height_size) {
            if ($this->save_image($source, $destination, $image_type, $quality)) {
                return true;
            }
        }

        //Construct a proportional size of new image
        $image_scale = min($max_width_size / $image_width, $max_height_size / $image_height);
        $new_width = ceil($image_scale * $image_width);
        $new_height = ceil($image_scale * $image_height);

        $new_canvas = imagecreatetruecolor($new_width, $new_height); //Create a new true color image
        //Copy and resize part of an image with resampling
        if (imagecopyresampled($new_canvas, $source, 0, 0, 0, 0, $new_width, $new_height, $image_width, $image_height)) {
            $this->save_image($new_canvas, $destination, $image_type, $quality); //save resized image
        }

        return true;
    }

    private function watermark($from_filename, $watermark_filename, $save_filename) {
        $image = imagecreatefromjpeg($from_filename);
        $watermark = imagecreatefrompng($watermark_filename);

        $marge_right = 10;
        $marge_bottom = 10;
        $sx = imagesx($watermark);

        imagecopy($image, $watermark, imagesx($image) - $sx - $marge_right, $marge_bottom, 0, 0, imagesx($watermark), imagesy($watermark));

        return imagejpeg($image, $save_filename);
    }

    private function save_image($source, $destination, $image_type, $quality) {
        switch (strtolower($image_type)) {
            case 'image/jpeg': case 'image/pjpeg':
                imagejpeg($source, $destination, $quality);
                return true; //save jpeg file
            default: return false;
        }
    }

    private function toGroup($filters = []) {
        if (count($filters) > 1) {
            $filtersGroup = [];
            $len = count($filters);
            foreach ($filters as $key => $value) {
                if ($key != $len - 1) {
                    $values = explode('=', $value);
                    $filtersGroup[$values[0]][] = $values[1];
                }
            }

            return $filtersGroup;
        } else {
            return [];
        }
    }

    private function utf8_encode_deep(&$input) {
        if (is_string($input)) {
            $input = utf8_encode($input);
        } else if (is_array($input)) {
            foreach ($input as &$value) {
                $this->utf8_encode_deep($value);
            }

            unset($value);
        } else if (is_object($input)) {
            $vars = array_keys(get_object_vars($input));

            foreach ($vars as $var) {
                $this->utf8_encode_deep($input->$var);
            }
        }
    }

    private function utf8_decode_deep(&$input) {
        if (is_string($input)) {
            $input = utf8_decode($input);
        } else if (is_array($input)) {
            foreach ($input as &$value) {
                $this->utf8_decode_deep($value);
            }

            unset($value);
        } else if (is_object($input)) {
            $vars = array_keys(get_object_vars($input));

            foreach ($vars as $var) {
                $this->utf8_decode_deep($input->$var);
            }
        }
    }

    public function load($model_name) {
        try {
            $this->model = $this->loadModel($model_name);
        } catch (Exception $e) {
            \core\Error::setError($e->getMessage());

            $error['error'] = \core\Error::getErrors();
            echo json_encode($error);
            exit();
        } catch (PDOException $e) {
            \core\Error::setError(1100);

            $error['error'] = \core\Error::getErrors();
            echo json_encode($error);
            exit();
        }
    }

    private function checkticket($ticket) {
        if (!filter_has_var(INPUT_POST, $ticket)) {
            \core\Error::setError('Not assecpted to request!');

            $error['error'] = \core\Error::getErrors();
            echo json_encode($error);
            exit();
        }
    }

}
