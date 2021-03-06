/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

Wick.ClipAsset = class extends Wick.FileAsset {
    /**
     * Returns all valid MIME types for files which can be converted to ClipAssets.
     * @return {string[]} Array of strings of MIME types in the form MediaType/Subtype.
     */
    static getValidMIMETypes() {
        return ['application/json', 'application/octet-stream'];
    }

    /**
     * Returns all valid extensions types for files which can be attempted to be
     * converted to ClipAssets.
     * @return  {string[]} Array of strings representing extensions.
     */
    static getValidExtensions() {
        return ['.wickobj']
    }

    /**
     * Creates a ClipAsset from the data of a given Clip.
     * @param {Wick.Clip} - the clip to use as a source
     * @param {function} callback -
     */
    static fromClip (clip, project, callback) {
        project.addObject(clip);
        Wick.WickObjectFile.toWickObjectFile(clip, 'blob', file => {
            // Convert blob to dataURL
            var a = new FileReader();
            a.onload = (e) => {
                // Create ClipAsset
                var clipAsset = new Wick.ClipAsset({
                    filename: (clip.identifier || 'clip') + '.wickobj',
                    src: e.target.result,
                });
                clip.remove();
                callback(clipAsset);
            }
            a.readAsDataURL(file);
        });
    }

    /**
     * Create a new ClipAsset.
     * @param {object} args
     */
    constructor(args) {
        super(args);
    }

    _serialize(args) {
        var data = super._serialize(args);
        return data;
    }

    _deserialize(data) {
        super._deserialize(data);
    }

    get classname() {
        return 'ClipAsset';
    }

    /**
     * A list of Wick Clips that use this ClipAsset as their source.
     * @returns {Wick.Clip[]}
     */
    getInstances () {
        var clips = [];
        this.project.getAllFrames().forEach(frame => {
            frame.clips.forEach(clip => {
                if(clip.assetSourceUUID === this.uuid) {
                    clips.push(clip);
                }
            });
        });
        return clips;
    }

    /**
     * Check if there are any objects in the project that use this asset.
     * @returns {boolean}
     */
    hasInstances () {
        return this.getInstances().length > 0;
    }

    /**
     * Removes all Clips using this asset as their source from the project.
     * @returns {boolean}
     */
    removeAllInstances () {
        this.getInstances().forEach(instance => {
            instance.remove();
        });

        // Also remove any ImageAssets that are part of this clip, and are GIF frames
        this.project.getAllFrames().forEach(frame => {
            frame.paths.forEach(path => {
                var images = path.getLinkedAssets();
                if(images.length > 0 && images[0].gifAssetUUID === this.uuid) {
                    images[0].remove();
                }
            });
        });
    }

    /**
     * Load data in the asset
     * @param {function} callback - function to call when the data is done being loaded.
     */
    load(callback) {
        // We don't need to do anything here, the data for ClipAssets is just json
        callback();
    }

    /**
     * Creates a new Wick Clip that uses this asset's data.
     * @param {function} callback - called when the Clip is done loading.
     */
    createInstance (callback, project) {
        if (!callback) { console.warn("Cannot create clip instance without callback.") }
        if (!project) { console.warn("Cannot create clip instance without project reference.") }

        Wick.WickObjectFile.fromWickObjectFile(this.src, data => {
            var clip = Wick.Base.import(data, project).copy();
            clip.assetSourceUUID = this.uuid;
            callback(clip);
        });
    }
}
