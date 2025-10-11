<?php

/*
 * This file is part of steperlin/flarum-markdown.
 *
 * Copyright (c) 2024 steperlin.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Steperlin\Markdown;

/**
 * Extension information and utilities
 */
class Extension
{
    /**
     * Extension version
     */
    public const VERSION = '2.1.3';

    /**
     * Extension name
     */
    public const NAME = 'flarum-markdown';

    /**
     * Extension title
     */
    public const TITLE = 'Markdown';

    /**
     * Extension description
     */
    public const DESCRIPTION = 'A modern, secure Markdown extension for Flarum with client-side rendering using marked.js';

    /**
     * Get extension information
     *
     * @return array
     */
    public static function getInfo(): array
    {
        return [
            'name' => self::NAME,
            'title' => self::TITLE,
            'description' => self::DESCRIPTION,
            'version' => self::VERSION,
            'author' => 'steperlin',
            'website' => 'https://zhichai.net',
            'repository' => 'https://github.com/linkerlin/flarum-markdown',
        ];
    }

    /**
     * Check if the extension is compatible with current Flarum version
     *
     * @param string $flarumVersion
     * @return bool
     */
    public static function isCompatible(string $flarumVersion): bool
    {
        return version_compare($flarumVersion, '2.0.0-beta.3', '>=');
    }
}