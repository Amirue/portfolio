<?php
/**
 * Create sample work posts on LIVE WordPress.
 * Upload to public_html/ and access via browser: https://wp.amiruan.site/create-works.php
 * DELETE THIS FILE AFTER RUNNING.
 */
define('WP_USE_THEMES', false);
require_once(dirname(__FILE__) . '/wp-load.php');

$works = array(
    array(
        'title' => 'Fintech Dashboard Design System',
        'slug' => 'fintech-dashboard',
        'type' => 'uiux',
        'subtitle' => 'A scalable component library for fintech',
        'role' => 'Design + Development',
        'tools' => 'Figma, React, TypeScript, Tailwind CSS',
        'metric' => '99/100 Lighthouse Accessibility',
        'year' => '2025',
        'context' => 'A fintech client needed a design system that could scale across web and mobile. The existing UI was inconsistent and hard to maintain.',
        'process' => 'Built a reusable component library with design tokens, documented every component, and created a living style guide the team could reference.',
        'demo_url' => '',
        'content' => 'The dashboard had 40+ screens with inconsistent patterns. We created a unified system with atomic design principles.',
    ),
    array(
        'title' => 'Headless Commerce Platform',
        'slug' => 'headless-commerce',
        'type' => 'wordpress',
        'subtitle' => 'Decoupled WordPress + GraphQL storefront',
        'role' => 'Backend + Frontend Development',
        'tools' => 'WordPress, GraphQL, Next.js, ACF Pro',
        'metric' => '0.2s Average Response',
        'year' => '2025',
        'context' => 'An e-commerce client wanted faster page loads and more flexibility than their traditional WordPress theme allowed.',
        'process' => 'Decoupled the frontend using GraphQL, implemented incremental static regeneration, and kept WordPress as the content backend.',
        'demo_url' => '',
        'content' => 'The old site took 3+ seconds to load. After the rebuild, pages load in under 200ms.',
    ),
    array(
        'title' => 'AI Knowledge Assistant',
        'slug' => 'ai-knowledge-assistant',
        'type' => 'ai',
        'subtitle' => 'RAG-powered domain-specific assistant',
        'role' => 'AI Engineering',
        'tools' => 'OpenAI API, Vector DBs, LangChain, Python',
        'metric' => '94% Response Accuracy',
        'year' => '2025',
        'context' => 'A team had hundreds of internal documents and needed an AI assistant that could answer domain-specific questions accurately.',
        'process' => 'Implemented RAG with vector embeddings, fine-tuned the retrieval pipeline, and built a real-time chat interface.',
        'demo_url' => '',
        'content' => 'The assistant can answer questions about internal processes with 94% accuracy using semantic search over the document corpus.',
    ),
    array(
        'title' => 'Automated Printing Pipeline',
        'slug' => 'automated-printing',
        'type' => 'wordpress',
        'subtitle' => 'Docker-based order printing automation',
        'role' => 'Backend Engineering',
        'tools' => 'Docker, PHP, PrintNode, Webhooks',
        'metric' => '10K+ Orders Automated',
        'year' => '2024',
        'context' => 'A retail client was manually printing thousands of orders. They needed automation that would not break their existing workflow.',
        'process' => 'Built a Docker container that listens for order webhooks and silently dispatches print jobs to thermal printers.',
        'demo_url' => '',
        'content' => 'The system handles 10K+ orders without manual intervention, reducing printing errors to near zero.',
    ),
    array(
        'title' => 'Global Brand Website Redesign',
        'slug' => 'brand-website-redesign',
        'type' => 'uiux',
        'subtitle' => 'Performance-first brand experience',
        'role' => 'Design + Development',
        'tools' => 'Figma, Tailwind CSS, Astro, Vercel',
        'metric' => '+180% Engagement Lift',
        'year' => '2024',
        'context' => 'A global brand needed a website redesign that would improve engagement without sacrificing performance.',
        'process' => 'Designed a scroll-driven experience with performance-first approach, optimized every asset, and implemented smooth animations.',
        'demo_url' => '',
        'content' => 'The redesign drove a 180% increase in engagement while keeping page load times under 1 second.',
    ),
    array(
        'title' => 'AI Kiosk Interface',
        'slug' => 'ai-kiosk-interface',
        'type' => 'ai',
        'subtitle' => 'Voice-powered restaurant ordering kiosk',
        'role' => 'UX + AI Integration',
        'tools' => 'LLM Agents, Next.js, WebSockets, Voice API',
        'metric' => '30% Faster Checkout',
        'year' => '2024',
        'context' => 'A restaurant chain wanted a self-service kiosk that customers could interact with naturally using voice.',
        'process' => 'Built a touch-first interface with voice input, natural language processing, and generative UI feedback.',
        'demo_url' => '',
        'content' => 'The kiosk reduced checkout time by 30% and improved order accuracy through natural conversation.',
    ),
);

$output = '';
foreach ($works as $data) {
    $existing = get_page_by_path($data['slug'], OBJECT, 'work');
    if ($existing) {
        $output .= "SKIP (exists): {$data['title']}\n";
        continue;
    }

    $postId = wp_insert_post(array(
        'post_title'   => $data['title'],
        'post_name'    => $data['slug'],
        'post_content' => $data['content'],
        'post_excerpt' => $data['subtitle'],
        'post_status'  => 'publish',
        'post_type'    => 'work',
    ));

    if (is_wp_error($postId)) {
        $output .= "ERROR: {$data['title']}\n";
        continue;
    }

    if (function_exists('update_field')) {
        update_field('subtitle', $data['subtitle'], $postId);
        update_field('role', $data['role'], $postId);
        update_field('tools', $data['tools'], $postId);
        update_field('metric', $data['metric'], $postId);
        update_field('demo_url', $data['demo_url'], $postId);
        update_field('year', $data['year'], $postId);
        update_field('context', $data['context'], $postId);
        update_field('process', $data['process'], $postId);
    } else {
        update_post_meta($postId, 'subtitle', $data['subtitle']);
        update_post_meta($postId, 'role', $data['role']);
        update_post_meta($postId, 'tools', $data['tools']);
        update_post_meta($postId, 'metric', $data['metric']);
        update_post_meta($postId, 'demo_url', $data['demo_url']);
        update_post_meta($postId, 'year', $data['year']);
        update_post_meta($postId, 'context', $data['context']);
        update_post_meta($postId, 'process', $data['process']);
    }

    wp_set_object_terms($postId, $data['type'], 'work_type');

    $output .= "CREATED: {$data['title']} (ID: $postId)\n";
}

$output .= "\nDone! " . count($works) . " works processed.\n";

echo '<pre>' . htmlspecialchars($output) . '</pre>';
echo '<p><strong>DELETE THIS FILE NOW for security.</strong></p>';
