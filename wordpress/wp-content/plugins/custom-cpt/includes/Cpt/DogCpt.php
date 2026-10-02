<?php
/**
 * Custom Post Type: "Dog".
 */

namespace Custom\Cpt\Cpt;

use Custom\Cpt\Taxonomy\BreedTaxonomy;
use Flat101\Base\Model\Cpt;

class DogCpt extends Cpt {

	/**
	 * Post type key.
	 * Must not exceed 20 characters. Use lowercase alphanumeric characters and underscores.
	 *
	 * @var string
	 */
	public const POST_TYPE = 'dog';


	/**
	 * Load CPT config in $this->init_post_type_config.
	 * Now translations are loaded.
	 *
	 * @return void
	 */
	protected function init_post_type_config(): void {

		$this->post_type_config = array(
			'labels'          => array(
				'singular' => _x( 'Dog', 'Post type singular name', 'custom-cpt' ),
				'plural'   => _x( 'Dogs', 'Post type plural name', 'custom-cpt' ),
			),
			'menu'            => array(
				'icon'     => 'dashicons-buddicons-activity', // https://developer.wordpress.org/resource/dashicons
				'position' => 5, // Posts 5, Media 10, Links 15, Pages 20, Comments 25, Plugins 65, Users 70, Tools 75, Settings 80
			),
			'rewrite'         => array(
				'slug'       => 'doggies',
				'with_front' => true,
				'pages'      => true,
			),
			'public'          => array(
				'has_archive'         => true,
				'exclude_from_search' => false,
				'publicly_queryable'  => true,
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
				'thumbnail',
				'excerpt',
			),
			'admin_cols'      => array(
				array(
					'id'    => 'year',
					'label' => __( 'Year', 'custom-cpt' ),
				),
				// more...
			),
			'admin_filters'   => array(
				array(
					'id'    => 'dog-breed',
					'label' => 'Breed',
				),
				// more...
			),
		);
	}


	/**
	 * Register ACFs for this CPT.
	 *
	 * @return void
	 */
	public function register_custom_fields(): void {

		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		acf_add_local_field_group(
			array(
				'key'                   => 'group_dog',
				'title'                 => __( 'Dog Group', 'custom-cpt' ),
				'fields'                => array(
					array(
						'key'               => 'field_dog_cartoon',
						'label'             => __( 'Is it a cartoon?', 'custom-cpt' ),
						'name'              => 'cartoon',
						'aria-label'        => '',
						'type'              => 'true_false',
						'instructions'      => '',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => array(
							'width' => '',
							'class' => '',
							'id'    => '',
						),
						'message'           => '',
						'default_value'     => 0,
						'ui'                => 0,
						'ui_on_text'        => '',
						'ui_off_text'       => '',
					),
					array(
						'key'               => 'field_dog_year',
						'label'             => __( 'Year', 'custom-cpt' ),
						'name'              => 'year',
						'aria-label'        => '',
						'type'              => 'number',
						'instructions'      => '',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => array(
							'width' => '50',
							'class' => '',
							'id'    => '',
						),
						'default_value'     => '',
						'min'               => '',
						'max'               => '',
						'placeholder'       => '',
						'step'              => '',
						'prepend'           => '',
						'append'            => '',
					),
				),
				'location'              => array(
					array(
						array(
							'param'    => 'post_type',
							'operator' => '==',
							'value'    => 'dog',
						),
					),
				),
				'menu_order'            => 0,
				'position'              => 'normal',
				'style'                 => 'default',
				'label_placement'       => 'top',
				'instruction_placement' => 'label',
				'hide_on_screen'        => '',
				'active'                => true,
				'description'           => '',
				'show_in_rest'          => 0,
			)
		);
	}

	/**
	 * Render custom column content for this CPT.
	 *
	 * @param string $column_name The name of the column to display.
	 * @param int    $post_id The current post ID.
	 * @return void
	 */
	public function render_custom_column_content( string $column_name, int $post_id ): void {

		switch ( $column_name ) {
			case 'year':
				echo esc_html( get_field( 'year', $post_id ) );
				break;
			// more...
		}
	}


	/**
	 * Render custom filters on admin posts list table.
	 *
	 * @param string $post_type The post type slug.
	 * @param string $which The location of the extra table nav markup:
	 *  · 'top' or 'bottom' for WP_Posts_List_Table.
	 *  · 'bar' for WP_Media_List_Table.
	 * @return void
	 */
	public function render_custom_filters( string $post_type, string $which ): void {

		if ( self::POST_TYPE === $post_type ) {
			// Category Filter
			$this->render_taxonomy_filter( BreedTaxonomy::TAXONOMY_TYPE );
		}
	}

	/**
	 * Add custom filters to the CPT list in Dashboard.
	 *
	 * @param \WP_Query $wp_query The WP_Query instance (passed by reference).
	 * @return void
	 */
	public function add_custom_filters( \WP_Query $wp_query ): void {

		// @todo
	}
}
