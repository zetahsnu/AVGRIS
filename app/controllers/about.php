<?php

class About extends Controller {

    function __construct() {
        parent::__construct();
    }

    public function index() {        
        $this->view->render(__CLASS__, __FUNCTION__);
    }

}
