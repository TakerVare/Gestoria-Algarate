<?php
/**
 * Main Plugin.
 */

namespace Custom\Cpt;

use Custom\Cpt\Cpt\DogCpt;
use Custom\Cpt\Taxonomy\BreedTaxonomy;
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
		$this->cpts       = array( new DogCpt() );
		$this->taxonomies = array( new BreedTaxonomy() );

		// Define constants.
		define( 'CUSTOM_CPT__PATH', $this->path );
		define( 'CUSTOM_CPT__URL', $this->url );
	}
}
