<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Download extends Controller {

    private $descriptorsPath = './public/download/descriptors';
    private $record_sheetsPath = './public/download/record_sheets';
    private $othersPath = './public/download/others';
    private $protocolsPath = './public/download/protocols';

    function __construct() {
        parent::__construct();
    }

    public function index() {
        $files = [];

        $files['descriptors'] = $this->fileToGroupWithYear($this->descriptorsPath);

        if ($handle = opendir($this->protocolsPath)) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry == '.' || $entry == '..' || !is_dir($this->protocolsPath . '/' . $entry)) {
                    continue;
                }

                switch ($entry) {
                    case 'crops':
                        $files['protocols']['crops'] = $this->fileToGroupWithYear($this->protocolsPath . '/' . $entry);
                        break;
                    case 'tests':
                        $files['protocols']['tests'] = $this->fileToGroupWithYear($this->protocolsPath . '/' . $entry);
                        break;
                    case 'contents':
                        $files['protocols']['contents'] = $this->fileToGroupWithYear($this->protocolsPath . '/' . $entry);
                        break;
                }
            }

            closedir($handle);
        }

        if ($handle = opendir($this->record_sheetsPath)) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry == '.' || $entry == '..' || !is_dir($this->record_sheetsPath . '/' . $entry)) {
                    continue;
                }

                switch ($entry) {
                    case 'records':
                        $files['record_sheets']['records'] = $this->fileToGroupWithName($this->record_sheetsPath . '/' . $entry);
                        break;
                    case 'tests':
                        $files['record_sheets']['tests'] = $this->fileToGroupWithName($this->record_sheetsPath . '/' . $entry);
                        break;
                }
            }

            closedir($handle);
        }

        if ($handle = opendir($this->othersPath)) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry == '.' || $entry == '..' || !is_dir($this->othersPath . '/' . $entry)) {
                    continue;
                }

                switch ($entry) {
                    case 'maintained':
                        $files['others']['maintained'] = $this->fileToGroupWithMonth($this->othersPath . '/' . $entry);
                        break;
                    case 'keys':
                        $files['others']['keys'] = $this->fileToGroupWithName($this->othersPath . '/' . $entry);
                        break;
                    case 'treatments':
                        $files['others']['treatments'] = $this->fileToGroupWithName($this->othersPath . '/' . $entry);
                        break;
		    case 'morpho':
                        $files['others']['morpho'] = $this->fileToGroupWithName($this->othersPath . '/' . $entry);
                        break;
                }
            }

            closedir($handle);
        }

        $this->view->render(__CLASS__, __FUNCTION__, $files);
    }

    private function fileToGroupWithName($path) {
        $files = [];

        $j = 0;
        if ($handle = opendir($path)) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry == '.' || $entry == '..' || is_dir($path . '/' . $entry)) {
                    continue;
                }

                $names = explode('_', $entry);
                $len = count($names);
                $extention = explode('.', $names[$len - 1]);
                array_pop($names);
                $files[$j]['name'] = join('_', $names) . '_' . $extention[0];
                $files[$j]['extention'] = $extention[1];
                $j++;
            }

            closedir($handle);
        }

        return $files;
    }

    private function fileToGroupWithYear($path) {
        $files = [];

        $j = 0;
        if ($handle = opendir($path)) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry == '.' || $entry == '..' || is_dir($path . '/' . $entry)) {
                    continue;
                }

                $names = explode('_', $entry);
                $len = count($names);
                $files[$j]['name'] = '';
                if ($len > 2) {
                    for ($i = 0; $i < ($len - 1); $i++) {
                        $files[$j]['name'] .= $i === ($len - 2) ? $names[$i] : $names[$i] . ' ';
                    }
                } else {
                    $files[$j]['name'] .= $names[0];
                }
                $extention = explode('.', $names[$len - 1]);
                $files[$j]['year'] = $extention[0];
                $files[$j]['extention'] = $extention[1];
                $j++;
            }

            closedir($handle);
        }

        return $files;
    }

    private function fileToGroupWithMonth($path) {
        $files = [];

        $j = 0;
        if ($handle = opendir($path)) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry == '.' || $entry == '..' || is_dir($path . '/' . $entry)) {
                    continue;
                }

                $names = explode('_', $entry);
                $len = count($names);
                $extention = explode('.', $names[$len - 1]);
                $files[$names[0]][$j]['month'] = $extention[0];
                $files[$names[0]][$j]['extention'] = $extention[1];
                $j++;
            }

            krsort($files, SORT_NUMERIC);

            closedir($handle);
        }

        return $files;
    }

}
