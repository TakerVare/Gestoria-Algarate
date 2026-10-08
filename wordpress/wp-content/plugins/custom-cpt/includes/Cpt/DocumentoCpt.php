<?php
/**
 * Custom Post Type: "Documento".
 */

namespace Custom\Cpt\Cpt;

use Custom\Cpt\Taxonomy\EmpresaTaxonomy;
use Flat101\Base\Model\Cpt;

class DocumentoCpt extends Cpt {

	/**
	 * Post type key.
	 * Must not exceed 20 characters. Use lowercase alphanumeric characters and underscores.
	 *
	 * @var string
	 */
	public const POST_TYPE = 'documento';

	/**
	 * Load CPT config in $this->post_type_config.
	 *
	 * @return void
	 */
	protected function init_post_type_config(): void {

		$this->post_type_config = array(
			'labels'          => array(
				'singular' => _x( 'Document', 'Post type singular name', 'custom-cpt' ),
				'plural'   => _x( 'Documents', 'Post type plural name', 'custom-cpt' ),
			),
			'menu'            => array(
				'icon'     => 'dashicons-media-document',
				'position' => 6,
			),
			'rewrite'         => array(
				'slug'       => 'documentos',
				'with_front' => false,
				'pages'      => true,
			),
			'public'          => array(
				'has_archive'         => false,
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
				'show_in_nav_menus'   => false,
				'show_in_menu'        => true,
				'show_ui'             => true,
				'show_in_rest'        => true,
			),
			'capability_type' => 'post',
			'hierarchical'    => false,
			'supports'        => array(
				'title',
				'editor',
			),
			'admin_cols'      => array(),
			'admin_filters'   => array(
				array(
					'id'    => 'documento-empresa',
					'label' => __( 'Company', 'custom-cpt' ),
				),
			),
		);
	}

	/**
	 * Register ACFs for this CPT.
	 *
	 * @return void
	 */
	public function register_custom_fields(): void {
	}

	/**
	 * Render custom column content for this CPT.
	 *
	 * @param string $column_name The name of the column to display.
	 * @param int    $post_id     The current post ID.
	 * @return void
	 */
	public function render_custom_column_content( string $column_name, int $post_id ): void {
	}

	/**
	 * Render custom filters on admin posts list table.
	 *
	 * @param string $post_type The post type slug.
	 * @param string $which     The location of the extra table nav markup.
	 * @return void
	 */
	public function render_custom_filters( string $post_type, string $which ): void {

		if ( self::POST_TYPE === $post_type ) {
			$this->render_taxonomy_filter( EmpresaTaxonomy::TAXONOMY_TYPE );
		}
	}

	/**
	 * Add custom filters to the CPT list in Dashboard.
	 *
	 * @param \WP_Query $wp_query The WP_Query instance (passed by reference).
	 * @return void
	 */
	public function add_custom_filters( \WP_Query $wp_query ): void {
	}
}