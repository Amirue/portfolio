<?php
/**
 * Plugin Name: Gallery Post Type
 * Description: Registers a Gallery Post custom post type with custom fields for the portfolio gallery. Uses Featured Image + post attachments for images (no ACF PRO needed).
 * Version: 2.0.0
 * Author: Amiruan
 */

if (!defined('ABSPATH')) exit;

// Register Custom Post Type
function amiruan_register_gallery_post_type() {
    $labels = array(
        'name'               => 'Gallery Posts',
        'singular_name'      => 'Gallery Post',
        'menu_name'          => 'Gallery',
        'add_new'            => 'Add New',
        'add_new_item'       => 'Add New Gallery Post',
        'edit_item'          => 'Edit Gallery Post',
        'new_item'           => 'New Gallery Post',
        'view_item'          => 'View Gallery Post',
        'search_items'       => 'Search Gallery Posts',
        'not_found'          => 'No gallery posts found',
        'not_found_in_trash' => 'No gallery posts found in Trash',
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => true,
        'rewrite'            => array('slug' => 'gallery'),
        'supports'           => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_rest'       => true,
        'menu_icon'          => 'dashicons-format-gallery',
        'menu_position'      => 5,
    );

    register_post_type('gallery_post', $args);
}
add_action('init', 'amiruan_register_gallery_post_type');

// Register custom taxonomy for gallery type
function amiruan_register_gallery_type_taxonomy() {
    $labels = array(
        'name'              => 'Gallery Types',
        'singular_name'     => 'Gallery Type',
        'search_items'      => 'Search Gallery Types',
        'all_items'         => 'All Gallery Types',
        'edit_item'         => 'Edit Gallery Type',
        'update_item'       => 'Update Gallery Type',
        'add_new_item'      => 'Add New Gallery Type',
        'new_item_name'     => 'New Gallery Type Name',
        'menu_name'         => 'Gallery Types',
    );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_in_rest'      => true,
        'rewrite'           => array('slug' => 'gallery-type'),
    );

    register_taxonomy('gallery_type', array('gallery_post'), $args);
}
add_action('init', 'amiruan_register_gallery_type_taxonomy');

// Add default terms
function amiruan_add_default_gallery_types() {
    $terms = array('events', 'travel', 'studio', 'moments');
    foreach ($terms as $term) {
        if (!term_exists($term, 'gallery_type')) {
            wp_insert_term(ucfirst($term), 'gallery_type');
        }
    }
}
add_action('admin_init', 'amiruan_add_default_gallery_types');

// Register ACF fields (free ACF — text/number only, no Gallery field)
function amiruan_register_acf_fields() {
    if (!function_exists('acf_add_local_field_group')) return;

    acf_add_local_field_group(array(
        'key'      => 'group_gallery_post',
        'title'    => 'Gallery Post Details',
        'fields'   => array(
            array(
                'key'          => 'field_gallery_location',
                'label'        => 'Location',
                'name'         => 'location',
                'type'         => 'text',
                'instructions' => 'Where this photo was taken',
            ),
            array(
                'key'          => 'field_gallery_camera',
                'label'        => 'Camera',
                'name'         => 'camera',
                'type'         => 'text',
                'instructions' => 'Camera / lens used',
            ),
            array(
                'key'          => 'field_gallery_date_label',
                'label'        => 'Date Label',
                'name'         => 'date_label',
                'type'         => 'text',
                'instructions' => 'e.g. "Mar 2026" or "Sep 2025"',
            ),
            array(
                'key'           => 'field_gallery_views',
                'label'         => 'Views',
                'name'          => 'views',
                'type'          => 'number',
                'default_value' => 0,
            ),
            array(
                'key'           => 'field_gallery_likes',
                'label'         => 'Likes',
                'name'          => 'likes',
                'type'          => 'number',
                'default_value' => 0,
            ),
            array(
                'key'          => 'field_gallery_tags',
                'label'        => 'Tags',
                'name'         => 'tags',
                'type'         => 'text',
                'instructions' => 'Comma-separated tags (e.g. hackathon, buildinpublic, kuala-lumpur)',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'gallery_post',
                ),
            ),
        ),
        'style'            => 'default',
        'instruction_placement' => 'label',
    ));
}
add_action('acf/init', 'amiruan_register_acf_fields');

// Get all images for a gallery post: Featured Image + attached images
function amiruan_get_gallery_images($post_id) {
    $images = array();

    // 1. Featured Image (primary)
    $thumb_id = get_post_thumbnail_id($post_id);
    if ($thumb_id) {
        $url = wp_get_attachment_url($thumb_id);
        if ($url) {
            $images[] = array('id' => $thumb_id, 'url' => $url);
        }
    }

    // 2. All attached images (uploaded to this post)
    $attachments = get_posts(array(
        'post_type'      => 'attachment',
        'post_mime_type' => 'image',
        'post_parent'    => $post_id,
        'numberposts'    => 10,
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
    ));

    foreach ($attachments as $att) {
        // Skip if already added as featured image
        if ($att->ID == $thumb_id) continue;
        $url = wp_get_attachment_url($att->ID);
        if ($url) {
            $images[] = array('id' => $att->ID, 'url' => $url);
        }
    }

    return $images;
}

// Add custom fields to REST API response
function amiruan_gallery_rest_fields($response, $post, $request) {
    if ($post->post_type !== 'gallery_post') return $response;

    $galleryImages = amiruan_get_gallery_images($post->ID);

    $response->data['acf'] = array(
        'location'       => get_field('location', $post->ID) ?: '',
        'camera'         => get_field('camera', $post->ID) ?: '',
        'date_label'     => get_field('date_label', $post->ID) ?: '',
        'views'          => (int) get_field('views', $post->ID),
        'likes'          => (int) get_field('likes', $post->ID),
        'gallery_images' => $galleryImages,
        'tags'           => get_field('tags', $post->ID) ?: '',
    );

    // Add gallery_type terms
    $terms = wp_get_post_terms($post->ID, 'gallery_type', array('fields' => 'slugs'));
    $response->data['gallery_type'] = $terms;

    return $response;
}
add_filter('rest_prepare_gallery_post', 'amiruan_gallery_rest_fields', 10, 3);

// Show helpful instructions in the editor
function amiruan_gallery_editor_help() {
    $screen = get_current_screen();
    if ($screen && $screen->post_type === 'gallery_post') {
        echo '<div class="notice notice-info" style="margin: 10px 0;">
            <p><strong>📸 How to add images:</strong></p>
            <ol>
                <li><strong>Featured Image</strong> (right sidebar) = your primary/cover photo</li>
                <li><strong>Additional images:</strong> Use the <strong>Add Media</strong> button in the editor, or drag & drop images into the editor area. Images uploaded to this post will appear in the gallery.</li>
            </ol>
            <p>💡 <em>Tip: Upload images directly to the post (not the Media Library) so they get attached to it.</em></p>
        </div>';
    }
}
add_action('admin_notices', 'amiruan_gallery_editor_help');

// ============================================================
// ============================================================
// WORK CPT
// ============================================================

function amiruan_register_work_post_type() {
    $labels = array(
        'name'               => 'Works',
        'singular_name'      => 'Work',
        'menu_name'          => 'Works',
        'add_new'            => 'Add New',
        'add_new_item'       => 'Add New Work',
        'edit_item'          => 'Edit Work',
        'new_item'           => 'New Work',
        'view_item'          => 'View Work',
        'search_items'       => 'Search Works',
        'not_found'          => 'No works found',
        'not_found_in_trash' => 'No works found in Trash',
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => true,
        'rewrite'            => array('slug' => 'work'),
        'supports'           => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_rest'       => true,
        'menu_icon'          => 'dashicons-portfolio',
        'menu_position'      => 6,
    );

    register_post_type('work', $args);
}
add_action('init', 'amiruan_register_work_post_type');

function amiruan_register_work_type_taxonomy() {
    $labels = array(
        'name'              => 'Work Types',
        'singular_name'     => 'Work Type',
        'search_items'      => 'Search Work Types',
        'all_items'         => 'All Work Types',
        'edit_item'         => 'Edit Work Type',
        'update_item'       => 'Update Work Type',
        'add_new_item'      => 'Add New Work Type',
        'new_item_name'     => 'New Work Type Name',
        'menu_name'         => 'Work Types',
    );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_in_rest'      => true,
        'rewrite'           => array('slug' => 'work-type'),
    );

    register_taxonomy('work_type', array('work'), $args);
}
add_action('init', 'amiruan_register_work_type_taxonomy');

function amiruan_add_default_work_types() {
    $terms = array('uiux', 'wordpress', 'ai');
    foreach ($terms as $term) {
        if (!term_exists($term, 'work_type')) {
            wp_insert_term(ucfirst($term), 'work_type');
        }
    }
}
add_action('admin_init', 'amiruan_add_default_work_types');

function amiruan_register_work_acf_fields() {
    if (!function_exists('acf_add_local_field_group')) return;

    acf_add_local_field_group(array(
        'key'      => 'group_work_post',
        'title'    => 'Work Details',
        'fields'   => array(
            array(
                'key'   => 'field_work_subtitle',
                'label' => 'Subtitle',
                'name'  => 'subtitle',
                'type'  => 'text',
                'instructions' => 'Short tagline shown under the title',
            ),
            array(
                'key'   => 'field_work_role',
                'label' => 'My Role',
                'name'  => 'role',
                'type'  => 'text',
                'instructions' => 'e.g. "Design + Development"',
            ),
            array(
                'key'   => 'field_work_tools',
                'label' => 'Tools',
                'name'  => 'tools',
                'type'  => 'text',
                'instructions' => 'Comma-separated: "Figma, React, WordPress"',
            ),
            array(
                'key'   => 'field_work_metric',
                'label' => 'Metric',
                'name'  => 'metric',
                'type'  => 'text',
                'instructions' => 'Highlight stat: "99/100 Lighthouse"',
            ),
            array(
                'key'   => 'field_work_demo_url',
                'label' => 'Demo URL',
                'name'  => 'demo_url',
                'type'  => 'url',
                'instructions' => 'Live project URL for laptop demo (leave empty for image carousel)',
            ),
            array(
                'key'   => 'field_work_year',
                'label' => 'Year',
                'name'  => 'year',
                'type'  => 'text',
                'instructions' => 'e.g. "2025"',
            ),
            array(
                'key'   => 'field_work_context',
                'label' => 'The Context',
                'name'  => 'context',
                'type'  => 'textarea',
                'instructions' => 'Project background - appears on the detail page',
                'rows'  => 4,
            ),
            array(
                'key'   => 'field_work_process',
                'label' => 'The Process',
                'name'  => 'process',
                'type'  => 'textarea',
                'instructions' => 'How you built it - appears on the detail page',
                'rows'  => 4,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'work',
                ),
            ),
        ),
        'style' => 'default',
    ));
}
add_action('acf/init', 'amiruan_register_work_acf_fields');

function amiruan_get_work_images($post_id) {
    $images = array();

    $thumb_id = get_post_thumbnail_id($post_id);
    if ($thumb_id) {
        $url = wp_get_attachment_url($thumb_id);
        if ($url) {
            $images[] = array('id' => $thumb_id, 'url' => $url);
        }
    }

    $attachments = get_posts(array(
        'post_type'      => 'attachment',
        'post_mime_type' => 'image',
        'post_parent'    => $post_id,
        'numberposts'    => 10,
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
    ));

    foreach ($attachments as $att) {
        if ($att->ID == $thumb_id) continue;
        $url = wp_get_attachment_url($att->ID);
        if ($url) {
            $images[] = array('id' => $att->ID, 'url' => $url);
        }
    }

    return $images;
}

function amiruan_work_rest_fields($response, $post, $request) {
    if ($post->post_type !== 'work') return $response;

    $workImages = amiruan_get_work_images($post->ID);
    $tools = get_field('tools', $post->ID) ?: '';
    $toolsArr = array_filter(array_map('trim', explode(',', $tools)));

    $response->data['acf'] = array(
        'subtitle'     => get_field('subtitle', $post->ID) ?: '',
        'role'         => get_field('role', $post->ID) ?: '',
        'tools'        => $toolsArr,
        'metric'       => get_field('metric', $post->ID) ?: '',
        'demo_url'     => get_field('demo_url', $post->ID) ?: '',
        'year'         => get_field('year', $post->ID) ?: '',
        'context'      => get_field('context', $post->ID) ?: '',
        'process'      => get_field('process', $post->ID) ?: '',
        'work_images'  => $workImages,
    );

    $terms = wp_get_post_terms($post->ID, 'work_type', array('fields' => 'slugs'));
    $response->data['work_type'] = $terms;

    return $response;
}
add_filter('rest_prepare_work', 'amiruan_work_rest_fields', 10, 3);
