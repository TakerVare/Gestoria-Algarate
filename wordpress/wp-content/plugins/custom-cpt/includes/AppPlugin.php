<?php
/**
 * Main Plugin.
 */

namespace Custom\Cpt;

use Custom\Cpt\Cpt\DocumentoCpt;
use Custom\Cpt\Taxonomy\EmpresaTaxonomy;
use Flat101\Base\Model\Plugin\CptPlugin;

class AppPlugin extends CptPlugin {

	/**
	 * Method to be called at the end of the constructor.
	 * Plugin data is loaded.
	 *
	 * @return void
	 */
	protected function on_construct_end(): void {

		// Init properties
		$this->cpts       = array( new DocumentoCpt() );
		$this->taxonomies = array( new EmpresaTaxonomy() );

		// Define constants.
		define( 'CUSTOM_CPT__PATH', $this->path );
		define( 'CUSTOM_CPT__URL', $this->url );
	}
}
