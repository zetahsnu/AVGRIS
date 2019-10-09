<?php

/**
 * Description of Model
 *
 * @author Minx
 */
class Model {

    protected $db;
            
    function __construct() {
        $this->db = new Database();
    }

}
