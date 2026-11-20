<?php
/**
 * Plugin Name: Cloudflare Deploy Webhook
 * Description: Triggers a Cloudflare Pages rebuild when WordPress content changes (posts, pages, gallery, works, media).
 * Version: 1.0.0
 * Author: Amiruan
 */

if (!defined('ABSPATH')) exit;

// Deploy hook URL is NOT stored in this repo (public).
// Set it in wp-config.php (above "That's all, stop editing!"):
//   define('AMIRUAN_CF_DEPLOY_HOOK', 'https://api.cloudflare.com/.../new-hook');
// Or via server environment. Fails closed if absent.
function amiruan_cf_get_hook_url() {
    if (defined('AMIRUAN_CF_DEPLOY_HOOK') && is_string(AMIRUAN_CF_DEPLOY_HOOK)) {
        $url = trim(AMIRUAN_CF_DEPLOY_HOOK);
        if ($url !== '') return $url;
    }
    $env = getenv('AMIRUAN_CF_DEPLOY_HOOK');
    if (is_string($env) && trim($env) !== '') return trim($env);
    return '';
}

// Debounce: don't fire more than once every 30 seconds
function amiruan_cf_should_trigger() {
    $last = get_transient('amiruan_cf_last_trigger');
    if ($last) return false;
    set_transient('amiruan_cf_last_trigger', time(), 30);
    return true;
}

// Fire the webhook
function amiruan_cf_trigger_deploy($post_id = 0) {
    // Skip auto-saves and revisions
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id)) return;

    // Skip if recently triggered (debounce)
    if (!amiruan_cf_should_trigger()) return;

    // Only trigger for content types we care about
    $post_type = get_post_type($post_id);
    $relevant = array('post', 'page', 'gallery_post', 'work', 'attachment');
    if ($post_type && !in_array($post_type, $relevant)) return;

    // Fire webhook (async via wp_remote_post) — fail closed if no hook configured
    $hook = amiruan_cf_get_hook_url();
    if ($hook === '') {
        error_log('[Cloudflare Webhook] Skipped: AMIRUAN_CF_DEPLOY_HOOK not configured.');
        return;
    }
    $response = wp_remote_post($hook, array(
        'timeout' => 5,
        'blocking' => false, // Don't wait for response
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode(array(
            'trigger' => 'wordpress_content_update',
            'post_id' => $post_id,
            'post_type' => $post_type,
            'time' => current_time('mysql'),
        )),
    ));

    // Log for debugging
    error_log('[Cloudflare Webhook] Deploy triggered for post #' . $post_id . ' (' . $post_type . ')');
}

// Hook into post save/publish/update
add_action('save_post', 'amiruan_cf_trigger_deploy', 20, 1);

// Hook into media upload (so image changes trigger rebuilds)
add_action('add_attachment', 'amiruan_cf_trigger_deploy', 20, 1);

// Hook into post deletion
add_action('deleted_post', 'amiruan_cf_trigger_deploy', 20, 1);

// Hook into term changes (gallery_type, work_type)
function amiruan_cf_trigger_on_term($term_id, $tt_id, $taxonomy) {
    if (!amiruan_cf_should_trigger()) return;
    $hook = amiruan_cf_get_hook_url();
    if ($hook === '') {
        error_log('[Cloudflare Webhook] Skipped: AMIRUAN_CF_DEPLOY_HOOK not configured.');
        return;
    }
    wp_remote_post($hook, array(
        'timeout' => 5,
        'blocking' => false,
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode(array(
            'trigger' => 'term_updated',
            'taxonomy' => $taxonomy,
            'time' => current_time('mysql'),
        )),
    ));
    error_log('[Cloudflare Webhook] Deploy triggered for term change (' . $taxonomy . ')');
}
add_action('created_term', 'amiruan_cf_trigger_on_term', 20, 3);
add_action('edited_term', 'amiruan_cf_trigger_on_term', 20, 3);

// Admin notice showing webhook status
function amiruan_cf_webhook_admin_notice() {
    $screen = get_current_screen();
    if (!$screen || $screen->id !== 'plugins') return;
    if (amiruan_cf_get_hook_url() === '') {
        echo '<div class="notice notice-warning"><p><strong>Cloudflare Deploy Webhook</strong> is installed but <strong>not configured</strong> (missing <code>AMIRUAN_CF_DEPLOY_HOOK</code>). WP saves will NOT rebuild <code>amiruan.site</code> until this is set.</p></div>';
    } else {
        echo '<div class="notice notice-info"><p><strong>Cloudflare Deploy Webhook</strong> is active. Content changes auto-trigger a rebuild at <code>amiruan.site</code>.</p></div>';
    }
}
add_action('admin_notices', 'amiruan_cf_webhook_admin_notice');
