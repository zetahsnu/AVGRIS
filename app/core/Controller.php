<?php

/**
 * Description of Controller
 *
 * @author Minx
 */
class Controller {

    protected $model = null;
    protected $view = null;

    function __construct() {
        Session::init();
        $this->view = new View();
    }

    public function loadModel($model) {
        $filename = __DIR__ . '/../models/' . $model . '.php';
        if (file_exists($filename)) {
            require_once $filename;
            return new $model;
        } else {
            throw new Exception('Can\' load model');
        }
    }

    public function load($model_name) {
        try {
            $this->model = $this->loadModel($model_name);
        } catch (PDOException $e) {
            \core\Error::setError('1100');

            $error['title'] = 'Database Error';
            $error['errors'] = \core\Error::getErrors();
            $this->view->render('error', 'index', $error);
            exit();
        }
    }

}
