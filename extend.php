<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/common.less')
        // 注册前端依赖库
        ->js('https://cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js')
        ->js('https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/common.less')
        // 管理员界面也需要这些依赖（用于预览等功能）
        ->js('https://cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js')
        ->js('https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js'),

    // 移除 Extend\Formatter 配置，改用前端渲染
    // 保留本地化
    new Extend\Locales(__DIR__.'/locale'),
];