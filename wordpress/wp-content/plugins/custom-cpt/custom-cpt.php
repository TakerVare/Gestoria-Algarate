<?php
/**
 * Plugin Name:       Custom - Custom Post Types
 * Description:       Create custom post types and taxonomies to this site.
 * Author:            Flat 101
 * Author URI:        https://www.flat101.es
 * Text Domain:       custom-cpt
 * Domain Path:       /languages
 * Requires at least: 5.3.0
 * Requires PHP:      8.3.0
 *
 * WP MIN VERSION  https://make.wordpress.org/core/handbook/references/php-compatibility-and-wordpress-versions/
 * PHP MIN VERSION https://en.wikipedia.org/wiki/PHP
 */

namespace Custom\Cpt;

defined( 'WPINC' ) || die;

// Require "Flat 101 Base" mu-plugin
if ( ! defined( 'FLAT101_BASE__LOADED' ) ) {
	if ( is_admin() ) {
		deactivate_plugins( basename( __FILE__ ) );
		wp_trigger_error( '', '"Custom Post Types" plugin can not be activated because it requires "Flat 101 Base" mu-plugin.', E_USER_WARNING );
	}

	return;
}

$custom_cpt_plugin = new AppPlugin( __FILE__ );
$custom_cpt_plugin->init();
