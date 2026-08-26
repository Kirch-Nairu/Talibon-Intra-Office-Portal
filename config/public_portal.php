<?php

return [
    'dataMode' => 'prototype',
    'sampleLabel' => 'PROTOTYPE SAMPLE DATA',
    'municipality' => 'Municipality of Talibon, Bohol',
    'hero' => [
        'eyebrow' => 'One Talibon Digital Government Portal',
        'title' => 'One Talibon',
        'lead' => 'Connected services. Transparent governance. Better municipal coordination.',
        'description' => 'A unified public-facing prototype for municipal information, service discovery, transparency previews, projects, advisories, and secure employee access.',
    ],
    'services' => [
        ['title' => 'Business and Permits', 'description' => 'Explore municipal service information and office guidance for business and permit concerns.', 'status' => 'Service information'],
        ['title' => 'Civil and Community Services', 'description' => 'Find the municipal offices and service categories responsible for community and civil concerns.', 'status' => 'Service information'],
        ['title' => 'Public Information', 'description' => 'Access prototype public information, announcements, advisories, and transparency resources.', 'status' => 'Public information'],
        ['title' => 'Emergency and Advisories', 'description' => 'A future public entry point for official municipal advisories and emergency information.', 'status' => 'Digital integration planned'],
        ['title' => 'Municipal Departments', 'description' => 'Understand where municipal services are handled and how offices connect across the LGU.', 'status' => 'Office directory concept'],
        ['title' => 'Transparency Resources', 'description' => 'Preview how approved public records and governance information may be presented online.', 'status' => 'Prototype preview'],
    ],
    'transparency' => [
        ['label' => 'Published Documents', 'value' => 'Sample library', 'note' => 'Presentation concept only — not an official published document count.'],
        ['label' => 'Municipal Reports', 'value' => 'Sample summaries', 'note' => 'Prototype presentation only — not an official published municipal report.'],
        ['label' => 'Public Notices', 'value' => 'Sample notices', 'note' => 'Demonstrates a future public information surface.'],
    ],
    'projects' => [
        ['title' => 'Community Infrastructure', 'summary' => 'Example project card showing how approved municipal accomplishments may be presented.', 'tag' => 'Sample project'],
        ['title' => 'Service Modernization', 'summary' => 'Prototype presentation for future public-facing updates on municipal digital services.', 'tag' => 'Prototype concept'],
        ['title' => 'Public Information Access', 'summary' => 'Example initiative card for improving access to approved municipal information.', 'tag' => 'Sample initiative'],
    ],
    'dashboard' => [
        ['label' => 'Public projects', 'value' => 'Sample view', 'detail' => 'Future public project summaries'],
        ['label' => 'Service availability', 'value' => 'Prototype', 'detail' => 'Public service-information status'],
        ['label' => 'Published information', 'value' => 'Sample view', 'detail' => 'Approved public documents and notices'],
        ['label' => 'Announcements', 'value' => 'Prototype', 'detail' => 'Public news and advisory surface'],
    ],
    'news' => [
        ['type' => 'Advisory', 'title' => 'Municipal advisory presentation', 'summary' => 'Sample content showing how an official advisory can appear on One Talibon.', 'date' => 'Prototype'],
        ['type' => 'Event', 'title' => 'Community event presentation', 'summary' => 'Sample event content for prototype presentation; official public event publishing is not yet enabled.', 'date' => 'Prototype'],
        ['type' => 'News', 'title' => 'Municipal update presentation', 'summary' => 'Example public-news card for client evaluation of the One Talibon experience.', 'date' => 'Prototype'],
    ],
    'contact' => [
        'heading' => 'Municipality of Talibon',
        'description' => 'This prototype demonstrates a unified public information experience while keeping employee operations inside the secured Core Portal.',
        'location' => 'Talibon, Bohol, Philippines',
    ],
];
