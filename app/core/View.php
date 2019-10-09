<?php

/**
 * Description of View
 *
 * @author Minx
 */
class View {

    protected $loader = null;
    protected $twig = null;

    function __construct() {
        
    }

    public function render($folder, $filename, $data = [], $return = false) {
        $this->loader = new Twig_Loader_Filesystem(__DIR__ . '/../views');
        $this->twig = new Twig_Environment($this->loader, ['strict_variables' => true]);
        $this->twig->addGlobal('SESSION', $_SESSION);
        $this->twig->addGlobal('BASE_PATH', BASE_PATH);
        if (!$return) {
            echo $this->twig->render('/' . $folder . '/' . $filename . '.html.twig', $data);
        } else {
            return $this->twig->render('/' . $folder . '/' . $filename . '.html.twig', $data);
        }
    }

}
