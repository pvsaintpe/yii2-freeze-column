<?php

namespace pvsaintpe\freeze;

use kartik\base\AssetBundle;

/**
 * Class FreezeAsset
 * @package pvsaintpe\freeze
 *
 * @author Pavel Veselov [pvsaintpe@icloud.com)
 */
class FreezeAsset extends AssetBundle
{
    /**
     * @inheritdoc
     */
    public function init()
    {
        $this->setSourcePath(__DIR__ . '/assets');
        $this->setupAssets('css', ['freeze']);
        $this->setupAssets('js', ['freeze']);
        parent::init();
    }
}