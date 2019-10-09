<?php

/**
 * Description of search
 *
 * @author Minx
 */
class Search extends Controller {

    private $characterization = [
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
    ];

    function __construct() {
        parent::__construct();
    }

    public function index() {
        $this->showError(404, '404 : Page Not Found');
    }

    public function passport($offset = 1) {
        $this->load('search_model');

        $part = filter_has_var(INPUT_POST, 'part') ? filter_input(INPUT_POST, 'part') : 0;
        //檢查過濾選項
        $filters = filter_has_var(INPUT_COOKIE, __FUNCTION__ . 'filters') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, __FUNCTION__ . 'filters'))) : [];
        //檢查排序選項
        $orders = filter_has_var(INPUT_COOKIE, __FUNCTION__ . 'orders') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, __FUNCTION__ . 'orders'))) : [];

        $this->model->table = __FUNCTION__;

        //每頁顯示，預設20
        $limitRow = filter_has_var(INPUT_COOKIE, 'perPageRow') ? filter_input(INPUT_COOKIE, 'perPageRow') : 20;
        //offset值
        $offset = is_numeric($offset) && $offset > 0 ? $offset : 1;

        $data['total'] = $this->model->countRow($filters);
        $data['offset'] = $offset > ceil($data['total'] / $limitRow) ? ceil($data['total'] / $limitRow) == 0 ? 1 : ceil($data['total'] / $limitRow) : $offset;
        $data['data'] = $this->model->fetchOffsetRow($data['offset'], $limitRow, $filters, $orders);

        if (!$part) {
            $data['limitRow'] = $limitRow;
            $data['title'] = $this->splitTitle(strtoupper(__FUNCTION__));
            $data['genus'] = array_filter($this->model->getList('genus'));
            $data['country'] = array_filter($this->model->getList('country'));
            $data['dissta'] = array_filter($this->model->getList('dissta'));

            $this->view->render(__CLASS__, __FUNCTION__, $data);
        } else {
            $data['data'] = $this->view->render(__CLASS__, __FUNCTION__ . '_part', $data, true);

            echo json_encode($data);
        }
    }

    public function characterization($subcategory = null, $offset = 1) {
        $this->load('search_model');

        if ($subcategory != null) {
            $subcategory = strtolower($subcategory);
            if (in_array($subcategory, $this->characterization)) {
                $part = filter_has_var(INPUT_POST, 'part') ? filter_input(INPUT_POST, 'part') : 0;
                //檢查過濾選項
                $filters = filter_has_var(INPUT_COOKIE, $subcategory . 'filters') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, $subcategory . 'filters'))) : [];
                //檢查排序選項
                $orders = filter_has_var(INPUT_COOKIE, $subcategory . 'orders') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, $subcategory . 'orders'))) : [];

                $this->model->table = $subcategory;

                //每頁顯示，預設20
                $limitRow = filter_has_var(INPUT_COOKIE, 'perPageRow') ? filter_input(INPUT_COOKIE, 'perPageRow') : 20;
                //offset值
                $offset = is_numeric($offset) && $offset > 0 ? $offset : 1;

                $data['category'] = $subcategory;
                $data['total'] = $this->model->countRow($filters);
                $data['offset'] = $offset > ceil($data['total'] / $limitRow) ? ceil($data['total'] / $limitRow) == 0 ? 1 : ceil($data['total'] / $limitRow) : $offset;
                $data['data'] = $this->model->fetchOffsetRow($data['offset'], $limitRow, $filters, $orders);

                if (!$part) {
                    $data['limitRow'] = $limitRow;
                    $data['title'] = $this->splitTitle(strtoupper($subcategory));
                    $data['species'] = array_filter($this->model->getList('species'));
                    $data['country'] = array_filter($this->model->getList('country'));

                    $this->view->render(__CLASS__, 'subcategory', $data);
                } else {
                    $data['data'] = $this->view->render(__CLASS__, 'subcategory_part', $data, true);

                    echo json_encode($data);
                }
            } else {
                $this->showError(404, '404 : Page Not Found');
            }
        } else {
            foreach ($this->characterization as $value) {
                $this->model->table = $value;
                $data['data'][] = [
                    'name' => $value,
                    'count' => $this->model->countRow(),
                    'title' => $this->splitTitle(ucfirst($value))
                ];
            }

            $this->view->render(__CLASS__, __FUNCTION__, $data);
        }
    }

    public function evaluation($offset = 1) {
        $this->load('search_model');

        $part = filter_has_var(INPUT_POST, 'part') ? filter_input(INPUT_POST, 'part') : 0;
        //檢查過濾選項
        $filters = filter_has_var(INPUT_COOKIE, __FUNCTION__ . 'filters') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, __FUNCTION__ . 'filters'))) : [];
        //檢查排序選項
        $orders = filter_has_var(INPUT_COOKIE, __FUNCTION__ . 'orders') ? get_object_vars(json_decode(filter_input(INPUT_COOKIE, __FUNCTION__ . 'orders'))) : [];

        $this->model->table = __FUNCTION__;

        //每頁顯示，預設20
        $limitRow = filter_has_var(INPUT_COOKIE, 'perPageRow') ? filter_input(INPUT_COOKIE, 'perPageRow') : 20;
        //offset值
        $offset = is_numeric($offset) && $offset > 0 ? $offset : 1;

        $data['total'] = $this->model->countRow($filters);
        $data['offset'] = $offset > ceil($data['total'] / $limitRow) ? ceil($data['total'] / $limitRow) == 0 ? 1 : ceil($data['total'] / $limitRow) : $offset;
        $data['data'] = $this->model->fetchOffsetRow($data['offset'], $limitRow, $filters, $orders);

        if (!$part) {
            $data['limitRow'] = $limitRow;
            $data['title'] = $this->splitTitle(strtoupper(__FUNCTION__));

            $Columns = ['genus', 'country',
                'heat', 'cold', 'drought', 'flood', 'salinity',
                'daccur', 'bruchid', 'res_cotapd', 'res_cotlfhper',
                'res_tanspo', 'res_halobl', 'tmbacwt', 'egbacwt',
                'powmild', 'tmlatebl', 'ppanthr', 'ppphytobl',
                'byvmv', 'cvmv', 'cmv5', 'cmvcot', 'cmvcot', 'pmmv', 'pvy', 'tmv', 'tomv'];

            $data['columns'] = array_filter($this->model->getMultiList($Columns));

            foreach ($data['columns'] as $key => $value) {
                $data['columns'][$key] = array_filter($value);

                if (count(array_filter($data['columns'][$key])) > 0) {
                    foreach ($data['columns'][$key] as $key2 => $value2) {
                        $$key2 = isset($$key2) ? $$key2 : [];

                        if (!in_array($value2, $$key2)) {
                            array_push($$key2, $value2);
                        }

                        $data['columnsf'][$key2] = $$key2;
                    }
                } else {
                    unset($data['columns'][$key]);
                }
            }

            $this->view->render(__CLASS__, __FUNCTION__, $data);
        } else {
            $data['data'] = $this->view->render(__CLASS__, __FUNCTION__ . '_part', $data, true);

            echo json_encode($data);
        }
    }

    /*
     * 檢視單一筆
     */

    public function view($category, $subcategory = NULL, $idno = NULL) {
        $this->load('search_model');

        $category = strtolower($category);

        switch ($category) {
            case 'passport':
                if (strlen($subcategory) != 8) {
                    $this->showError(1200, 'Record Not Found');
                    break;
                }

                $vi = explode('VI', strtoupper($subcategory));

                if (is_numeric($vi[1])) {
                    $this->model->table = $category;

                    if (($result = $this->model->fetchRow($subcategory)) === false) {
                        $this->showError(1200, 'Record Not Found');
                    } else {
                        $data['data'] = $result;
                    }

                    $data['title'] = strtoupper($category);

                    $this->view->render(__FUNCTION__, $category, $data);
                } else {
                    $this->showError(1200, 'Record Not Found');
                }
                break;
            case 'evaluation':
                if (is_numeric($subcategory) && $subcategory > 0) {
                    $this->model->table = $category;

                    if (($result = $this->model->fetchRow($subcategory)) === false) {
                        $this->showError(1200, 'Record Not Found');
                    } else {
                        $data['data'] = $result;
                    }

                    $data['title'] = strtoupper($category);

                    $this->view->render(__FUNCTION__, $category, $data);
                } else {
                    $this->showError(1200, 'Record Not Found');
                }
                break;
            case 'characterization':
                $subcategory = strtolower($subcategory);

                if (in_array($subcategory, $this->characterization)) {
                    if (is_numeric($idno) && $idno > 0) {
                        $this->model->table = $subcategory;

                        if (($result = $this->model->fetchRow($idno)) === false) {
                            $this->showError(1200, 'Record Not Found');
                        } else {
                            $data['data'] = $result;
                        }

                        $data['title'] = $this->splitTitle(strtoupper($subcategory));
                        $data['pic_path'] = file_exists(__DIR__ . '../../pictures/' . $subcategory . '/' . $idno . '.jpg') ? '/app/pictures/' . $subcategory . '/' . $idno . '.jpg' : null;

                        $this->view->render(__FUNCTION__, $subcategory, $data);
                    } else {
                        $this->showError(1200, 'Record Not Found');
                    }
                } else {
                    $this->showError(1200, 'Record Not Found');
                }
                break;
            default :
                $this->showError(1200, 'Record Not Found');
                break;
        }
    }

    /**
     * 回傳單一個欄位的值
     * @param type $table
     * @param type $column
     */
    public function listColumn($table, $column) {
        if (filter_has_var(INPUT_POST, 'filters')) {
            $this->load('search_model');
            $this->model->table = $table;

            $filters = filter_input(INPUT_POST, 'filters');
            $filters = explode(',', $filters);
            $filtersGroup = $this->toGroup($filters);

            $data['data'] = array_filter($this->model->getList($column, $filtersGroup));

            $data['data'] = $this->view->render(__CLASS__, 'list', $data, true);

            echo json_encode($data);
        }
    }

    private function splitTitle($title) {
        $titles = explode('_', $title);
        return count($titles) > 1 ? $titles[0] . " " . $titles[1] : $title;
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

    private function showError($error_number = null, $title = null) {
        core\Error::setError($error_number);

        $data['title'] = $title;
        $data['errors'] = core\Error::getErrors();

        $this->view->render('error', 'index', $data);
        exit();
    }

}
