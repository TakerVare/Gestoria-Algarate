<?php
/**
 * Taxonomy: "Breed".
 */

namespace Custom\Cpt\Taxonomy;

use Custom\Cpt\Cpt\DogCpt;
use Flat101\Base\Model\Taxonomy;

class BreedTaxonomy extends Taxonomy {

	/**
	 * Taxonomy key.
	 * Must not exceed 32 characters. Use lowercase alphanumeric characters and underscores.
	 *
	 * @var string
	 */
	public const TAXONOMY_TYPE = 'dog_breed';

	public const POST_TYPES = array( DogCpt::POST_TYPE );


	/**
	 * Load Taxonomy config in $this->taxonomy_config.
	 * Now translations are loaded.
	 *
	 * @return void
	 */
	protected function init_taxonomy_config(): void {

		$this->taxonomy_config = array(
			'labels'       => array(
				'singular' => _x( 'Breed', 'Taxonomy singular name', 'custom-cpt' ),
				'plural'   => _x( 'Breeds', 'Taxonomy plural name', 'custom-cpt' ),
			),
			'rewrite'      => array(
				'slug'         => 'dog-breed',
				'with_front'   => true,
				'hierarchical' => true,
			),
			'public'       => array(
				'publicly_queryable' => true,
				'show_in_nav_menus'  => false,
				'show_in_menu'       => true,
				'show_ui'            => true,
				'show_in_rest'       => true,
				'show_admin_column'  => true,
				'show_tagcloud'      => true,
				'show_in_quick_edit' => true,
			),
			'hierarchical' => false,
			'meta_box_cb'  => 'post_categories_meta_box',
			'admin_cols'   => array(),
		);
	}


	/**
	 * Register ACFs for this Taxonomy.
	 *
	 * @return void
	 */
	public function register_custom_fields(): void {

		// @todo
	}

	/**
	 * Render custom column content for this Taxonomy.
	 *
	 * @param string $str Custom column output. Default empty.
	 * @param string $column Name of the column.
	 * @param int    $term_id Term ID.
	 * @return string
	 */
	public function render_custom_column_content( string $str, string $column, int $term_id ): string {

		return $str;
	}
}
