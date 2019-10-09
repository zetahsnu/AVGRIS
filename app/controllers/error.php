<?php

use core\Error as Errors;

class Error extends Controller {

    function __construct() {
        parent::__construct();
    }

    public function index() {
        $data['title'] = '404 : Page not found';
        $data['errors'] = Errors::getErrors();

        $this->view->render(__CLASS__, __FUNCTION__, $data);
    }

}
