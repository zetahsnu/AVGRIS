<?php

class Index extends Controller {

    function __construct() {
        parent::__construct();
    }

    public function index() {
        $this->view->render(__CLASS__, __FUNCTION__);
    }

    public function getSessions() {
        $analytics = Analysis::getService();
        $profile = Analysis::getFirstProfileId($analytics);
        $results = Analysis::getSessions($analytics, $profile);

        $data['counter_value'] = $results->totalsForAllResults['ga:sessions'];

        echo json_encode($data, JSON_NUMERIC_CHECK);
    }

}
