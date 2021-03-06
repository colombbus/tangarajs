﻿var BABYLON;
(function (BABYLON) {
    (function (Internals) {
        var loadCubeTexture = function (rootUrl, parsedTexture, scene) {
            var texture = new BABYLON.CubeTexture(rootUrl + parsedTexture.name, scene);

            texture.name = parsedTexture.name;
            texture.hasAlpha = parsedTexture.hasAlpha;
            texture.level = parsedTexture.level;
            texture.coordinatesMode = parsedTexture.coordinatesMode;

            return texture;
        };

        var loadTexture = function (rootUrl, parsedTexture, scene) {
            if (!parsedTexture.name && !parsedTexture.isRenderTarget) {
                return null;
            }

            if (parsedTexture.isCube) {
                return loadCubeTexture(rootUrl, parsedTexture, scene);
            }

            var texture;

            if (parsedTexture.mirrorPlane) {
                texture = new BABYLON.MirrorTexture(parsedTexture.name, parsedTexture.renderTargetSize, scene);
                texture._waitingRenderList = parsedTexture.renderList;
                texture.mirrorPlane = BABYLON.Plane.FromArray(parsedTexture.mirrorPlane);
            } else if (parsedTexture.isRenderTarget) {
                texture = new BABYLON.RenderTargetTexture(parsedTexture.name, parsedTexture.renderTargetSize, scene);
                texture._waitingRenderList = parsedTexture.renderList;
            } else {
                texture = new BABYLON.Texture(rootUrl + parsedTexture.name, scene);
            }

            texture.name = parsedTexture.name;
            texture.hasAlpha = parsedTexture.hasAlpha;
            texture.getAlphaFromRGB = parsedTexture.getAlphaFromRGB;
            texture.level = parsedTexture.level;

            texture.coordinatesIndex = parsedTexture.coordinatesIndex;
            texture.coordinatesMode = parsedTexture.coordinatesMode;
            texture.uOffset = parsedTexture.uOffset;
            texture.vOffset = parsedTexture.vOffset;
            texture.uScale = parsedTexture.uScale;
            texture.vScale = parsedTexture.vScale;
            texture.uAng = parsedTexture.uAng;
            texture.vAng = parsedTexture.vAng;
            texture.wAng = parsedTexture.wAng;

            texture.wrapU = parsedTexture.wrapU;
            texture.wrapV = parsedTexture.wrapV;

            // Animations
            if (parsedTexture.animations) {
                for (var animationIndex = 0; animationIndex < parsedTexture.animations.length; animationIndex++) {
                    var parsedAnimation = parsedTexture.animations[animationIndex];

                    texture.animations.push(parseAnimation(parsedAnimation));
                }
            }

            return texture;
        };

        var parseSkeleton = function (parsedSkeleton, scene) {
            var skeleton = new BABYLON.Skeleton(parsedSkeleton.name, parsedSkeleton.id, scene);

            for (var index = 0; index < parsedSkeleton.bones.length; index++) {
                var parsedBone = parsedSkeleton.bones[index];

                var parentBone = null;
                if (parsedBone.parentBoneIndex > -1) {
                    parentBone = skeleton.bones[parsedBone.parentBoneIndex];
                }

                var bone = new BABYLON.Bone(parsedBone.name, skeleton, parentBone, BABYLON.Matrix.FromArray(parsedBone.matrix));

                if (parsedBone.animation) {
                    bone.animations.push(parseAnimation(parsedBone.animation));
                }
            }

            return skeleton;
        };

        var parseFresnelParameters = function (parsedFresnelParameters) {
            var fresnelParameters = new BABYLON.FresnelParameters();

            fresnelParameters.isEnabled = parsedFresnelParameters.isEnabled;
            fresnelParameters.leftColor = BABYLON.Color3.FromArray(parsedFresnelParameters.leftColor);
            fresnelParameters.rightColor = BABYLON.Color3.FromArray(parsedFresnelParameters.rightColor);
            fresnelParameters.bias = parsedFresnelParameters.bias;
            fresnelParameters.power = parsedFresnelParameters.power || 1.0;

            return fresnelParameters;
        };

        var parseMaterial = function (parsedMaterial, scene, rootUrl) {
            var material;
            material = new BABYLON.StandardMaterial(parsedMaterial.name, scene);

            material.ambientColor = BABYLON.Color3.FromArray(parsedMaterial.ambient);
            material.diffuseColor = BABYLON.Color3.FromArray(parsedMaterial.diffuse);
            material.specularColor = BABYLON.Color3.FromArray(parsedMaterial.specular);
            material.specularPower = parsedMaterial.specularPower;
            material.emissiveColor = BABYLON.Color3.FromArray(parsedMaterial.emissive);

            material.alpha = parsedMaterial.alpha;

            material.id = parsedMaterial.id;

            BABYLON.Tags.AddTagsTo(material, parsedMaterial.tags);
            material.backFaceCulling = parsedMaterial.backFaceCulling;
            material.wireframe = parsedMaterial.wireframe;

            if (parsedMaterial.diffuseTexture) {
                material.diffuseTexture = loadTexture(rootUrl, parsedMaterial.diffuseTexture, scene);
            }

            if (parsedMaterial.diffuseFresnelParameters) {
                material.diffuseFresnelParameters = parseFresnelParameters(parsedMaterial.diffuseFresnelParameters);
            }

            if (parsedMaterial.ambientTexture) {
                material.ambientTexture = loadTexture(rootUrl, parsedMaterial.ambientTexture, scene);
            }

            if (parsedMaterial.opacityTexture) {
                material.opacityTexture = loadTexture(rootUrl, parsedMaterial.opacityTexture, scene);
            }

            if (parsedMaterial.opacityFresnelParameters) {
                material.opacityFresnelParameters = parseFresnelParameters(parsedMaterial.opacityFresnelParameters);
            }

            if (parsedMaterial.reflectionTexture) {
                material.reflectionTexture = loadTexture(rootUrl, parsedMaterial.reflectionTexture, scene);
            }

            if (parsedMaterial.reflectionFresnelParameters) {
                material.reflectionFresnelParameters = parseFresnelParameters(parsedMaterial.reflectionFresnelParameters);
            }

            if (parsedMaterial.emissiveTexture) {
                material.emissiveTexture = loadTexture(rootUrl, parsedMaterial.emissiveTexture, scene);
            }

            if (parsedMaterial.emissiveFresnelParameters) {
                material.emissiveFresnelParameters = parseFresnelParameters(parsedMaterial.emissiveFresnelParameters);
            }

            if (parsedMaterial.specularTexture) {
                material.specularTexture = loadTexture(rootUrl, parsedMaterial.specularTexture, scene);
            }

            if (parsedMaterial.bumpTexture) {
                material.bumpTexture = loadTexture(rootUrl, parsedMaterial.bumpTexture, scene);
            }

            return material;
        };

        var parseMaterialById = function (id, parsedData, scene, rootUrl) {
            for (var index = 0; index < parsedData.materials.length; index++) {
                var parsedMaterial = parsedData.materials[index];
                if (parsedMaterial.id === id) {
                    return parseMaterial(parsedMaterial, scene, rootUrl);
                }
            }

            return null;
        };

        var parseMultiMaterial = function (parsedMultiMaterial, scene) {
            var multiMaterial = new BABYLON.MultiMaterial(parsedMultiMaterial.name, scene);

            multiMaterial.id = parsedMultiMaterial.id;

            BABYLON.Tags.AddTagsTo(multiMaterial, parsedMultiMaterial.tags);

            for (var matIndex = 0; matIndex < parsedMultiMaterial.materials.length; matIndex++) {
                var subMatId = parsedMultiMaterial.materials[matIndex];

                if (subMatId) {
                    multiMaterial.subMaterials.push(scene.getMaterialByID(subMatId));
                } else {
                    multiMaterial.subMaterials.push(null);
                }
            }

            return multiMaterial;
        };

        var parseLensFlareSystem = function (parsedLensFlareSystem, scene, rootUrl) {
            var emitter = scene.getLastEntryByID(parsedLensFlareSystem.emitterId);

            var lensFlareSystem = new BABYLON.LensFlareSystem("lensFlareSystem#" + parsedLensFlareSystem.emitterId, emitter, scene);
            lensFlareSystem.borderLimit = parsedLensFlareSystem.borderLimit;

            for (var index = 0; index < parsedLensFlareSystem.flares.length; index++) {
                var parsedFlare = parsedLensFlareSystem.flares[index];
                var flare = new BABYLON.LensFlare(parsedFlare.size, parsedFlare.position, BABYLON.Color3.FromArray(parsedFlare.color), rootUrl + parsedFlare.textureName, lensFlareSystem);
            }

            return lensFlareSystem;
        };

        var parseParticleSystem = function (parsedParticleSystem, scene, rootUrl) {
            var emitter = scene.getLastMeshByID(parsedParticleSystem.emitterId);

            var particleSystem = new BABYLON.ParticleSystem("particles#" + emitter.name, parsedParticleSystem.capacity, scene);
            if (parsedParticleSystem.textureName) {
                particleSystem.particleTexture = new BABYLON.Texture(rootUrl + parsedParticleSystem.textureName, scene);
                particleSystem.particleTexture.name = parsedParticleSystem.textureName;
            }
            particleSystem.minAngularSpeed = parsedParticleSystem.minAngularSpeed;
            particleSystem.maxAngularSpeed = parsedParticleSystem.maxAngularSpeed;
            particleSystem.minSize = parsedParticleSystem.minSize;
            particleSystem.maxSize = parsedParticleSystem.maxSize;
            particleSystem.minLifeTime = parsedParticleSystem.minLifeTime;
            particleSystem.maxLifeTime = parsedParticleSystem.maxLifeTime;
            particleSystem.emitter = emitter;
            particleSystem.emitRate = parsedParticleSystem.emitRate;
            particleSystem.minEmitBox = BABYLON.Vector3.FromArray(parsedParticleSystem.minEmitBox);
            particleSystem.maxEmitBox = BABYLON.Vector3.FromArray(parsedParticleSystem.maxEmitBox);
            particleSystem.gravity = BABYLON.Vector3.FromArray(parsedParticleSystem.gravity);
            particleSystem.direction1 = BABYLON.Vector3.FromArray(parsedParticleSystem.direction1);
            particleSystem.direction2 = BABYLON.Vector3.FromArray(parsedParticleSystem.direction2);
            particleSystem.color1 = BABYLON.Color4.FromArray(parsedParticleSystem.color1);
            particleSystem.color2 = BABYLON.Color4.FromArray(parsedParticleSystem.color2);
            particleSystem.colorDead = BABYLON.Color4.FromArray(parsedParticleSystem.colorDead);
            particleSystem.updateSpeed = parsedParticleSystem.updateSpeed;
            particleSystem.targetStopDuration = parsedParticleSystem.targetStopFrame;
            particleSystem.textureMask = BABYLON.Color4.FromArray(parsedParticleSystem.textureMask);
            particleSystem.blendMode = parsedParticleSystem.blendMode;
            particleSystem.start();

            return particleSystem;
        };

        var parseShadowGenerator = function (parsedShadowGenerator, scene) {
            var light = scene.getLightByID(parsedShadowGenerator.lightId);
            var shadowGenerator = new BABYLON.ShadowGenerator(parsedShadowGenerator.mapSize, light);

            for (var meshIndex = 0; meshIndex < parsedShadowGenerator.renderList.length; meshIndex++) {
                var mesh = scene.getMeshByID(parsedShadowGenerator.renderList[meshIndex]);

                shadowGenerator.getShadowMap().renderList.push(mesh);
            }

            if (parsedShadowGenerator.usePoissonSampling) {
                shadowGenerator.usePoissonSampling = true;
            } else {
                shadowGenerator.useVarianceShadowMap = parsedShadowGenerator.useVarianceShadowMap;
            }

            return shadowGenerator;
        };

        var parseAnimation = function (parsedAnimation) {
            var animation = new BABYLON.Animation(parsedAnimation.name, parsedAnimation.property, parsedAnimation.framePerSecond, parsedAnimation.dataType, parsedAnimation.loopBehavior);

            var dataType = parsedAnimation.dataType;
            var keys = [];
            for (var index = 0; index < parsedAnimation.keys.length; index++) {
                var key = parsedAnimation.keys[index];

                var data;

                switch (dataType) {
                    case BABYLON.Animation.ANIMATIONTYPE_FLOAT:
                        data = key.values[0];
                        break;
                    case BABYLON.Animation.ANIMATIONTYPE_QUATERNION:
                        data = BABYLON.Quaternion.FromArray(key.values);
                        break;
                    case BABYLON.Animation.ANIMATIONTYPE_MATRIX:
                        data = BABYLON.Matrix.FromArray(key.values);
                        break;
                    case BABYLON.Animation.ANIMATIONTYPE_VECTOR3:
                    default:
                        data = BABYLON.Vector3.FromArray(key.values);
                        break;
                }

                keys.push({
                    frame: key.frame,
                    value: data
                });
            }

            animation.setKeys(keys);

            return animation;
        };

        var parseLight = function (parsedLight, scene) {
            var light;

            switch (parsedLight.type) {
                case 0:
                    light = new BABYLON.PointLight(parsedLight.name, BABYLON.Vector3.FromArray(parsedLight.position), scene);
                    break;
                case 1:
                    light = new BABYLON.DirectionalLight(parsedLight.name, BABYLON.Vector3.FromArray(parsedLight.direction), scene);
                    light.position = BABYLON.Vector3.FromArray(parsedLight.position);
                    break;
                case 2:
                    light = new BABYLON.SpotLight(parsedLight.name, BABYLON.Vector3.FromArray(parsedLight.position), BABYLON.Vector3.FromArray(parsedLight.direction), parsedLight.angle, parsedLight.exponent, scene);
                    break;
                case 3:
                    light = new BABYLON.HemisphericLight(parsedLight.name, BABYLON.Vector3.FromArray(parsedLight.direction), scene);
                    light.groundColor = BABYLON.Color3.FromArray(parsedLight.groundColor);
                    break;
            }

            light.id = parsedLight.id;

            BABYLON.Tags.AddTagsTo(light, parsedLight.tags);

            if (parsedLight.intensity !== undefined) {
                light.intensity = parsedLight.intensity;
            }

            if (parsedLight.range) {
                light.range = parsedLight.range;
            }

            light.diffuse = BABYLON.Color3.FromArray(parsedLight.diffuse);
            light.specular = BABYLON.Color3.FromArray(parsedLight.specular);

            if (parsedLight.excludedMeshesIds) {
                light._excludedMeshesIds = parsedLight.excludedMeshesIds;
            }

            if (parsedLight.includedOnlyMeshesIds) {
                light._includedOnlyMeshesIds = parsedLight.includedOnlyMeshesIds;
            }

            // Animations
            if (parsedLight.animations) {
                for (var animationIndex = 0; animationIndex < parsedLight.animations.length; animationIndex++) {
                    var parsedAnimation = parsedLight.animations[animationIndex];

                    light.animations.push(parseAnimation(parsedAnimation));
                }
            }

            if (parsedLight.autoAnimate) {
                scene.beginAnimation(light, parsedLight.autoAnimateFrom, parsedLight.autoAnimateTo, parsedLight.autoAnimateLoop, 1.0);
            }
        };

        var parseCamera = function (parsedCamera, scene) {
            var camera;
            var position = BABYLON.Vector3.FromArray(parsedCamera.position);
            var lockedTargetMesh = (parsedCamera.lockedTargetId) ? scene.getLastMeshByID(parsedCamera.lockedTargetId) : null;

            if (parsedCamera.type === "AnaglyphArcRotateCamera" || parsedCamera.type === "ArcRotateCamera") {
                var alpha = parsedCamera.alpha;
                var beta = parsedCamera.beta;
                var radius = parsedCamera.radius;
                if (parsedCamera.type === "AnaglyphArcRotateCamera") {
                    var eye_space = parsedCamera.eye_space;
                    camera = new BABYLON.AnaglyphArcRotateCamera(parsedCamera.name, alpha, beta, radius, lockedTargetMesh, eye_space, scene);
                } else {
                    camera = new BABYLON.ArcRotateCamera(parsedCamera.name, alpha, beta, radius, lockedTargetMesh, scene);
                }
            } else if (parsedCamera.type === "AnaglyphFreeCamera") {
                var eye_space = parsedCamera.eye_space;
                camera = new BABYLON.AnaglyphFreeCamera(parsedCamera.name, position, eye_space, scene);
            } else if (parsedCamera.type === "DeviceOrientationCamera") {
                camera = new BABYLON.DeviceOrientationCamera(parsedCamera.name, position, scene);
            } else if (parsedCamera.type === "FollowCamera") {
                camera = new BABYLON.FollowCamera(parsedCamera.name, position, scene);
                camera.heightOffset = parsedCamera.heightOffset;
                camera.radius = parsedCamera.radius;
                camera.rotationOffset = parsedCamera.rotationOffset;
                if (lockedTargetMesh)
                    camera.target = lockedTargetMesh;
            } else if (parsedCamera.type === "GamepadCamera") {
                camera = new BABYLON.GamepadCamera(parsedCamera.name, position, scene);
            } else if (parsedCamera.type === "OculusCamera") {
                camera = new BABYLON.OculusCamera(parsedCamera.name, position, scene);
            } else if (parsedCamera.type === "TouchCamera") {
                camera = new BABYLON.TouchCamera(parsedCamera.name, position, scene);
            } else if (parsedCamera.type === "VirtualJoysticksCamera") {
                camera = new BABYLON.VirtualJoysticksCamera(parsedCamera.name, position, scene);
            } else if (parsedCamera.type === "WebVRCamera") {
                camera = new BABYLON.WebVRCamera(parsedCamera.name, position, scene);
            } else if (parsedCamera.type === "VRDeviceOrientationCamera") {
                camera = new BABYLON.VRDeviceOrientationCamera(parsedCamera.name, position, scene);
            } else {
                // Free Camera is the default value
                camera = new BABYLON.FreeCamera(parsedCamera.name, position, scene);
            }

            // Test for lockedTargetMesh & FreeCamera outside of if-else-if nest, since things like GamepadCamera extend FreeCamera
            if (lockedTargetMesh && camera instanceof BABYLON.FreeCamera) {
                camera.lockedTarget = lockedTargetMesh;
            }

            camera.id = parsedCamera.id;

            BABYLON.Tags.AddTagsTo(camera, parsedCamera.tags);

            // Parent
            if (parsedCamera.parentId) {
                camera._waitingParentId = parsedCamera.parentId;
            }

            // Target
            if (parsedCamera.target) {
                camera.setTarget(BABYLON.Vector3.FromArray(parsedCamera.target));
            } else {
                camera.rotation = BABYLON.Vector3.FromArray(parsedCamera.rotation);
            }

            camera.fov = parsedCamera.fov;
            camera.minZ = parsedCamera.minZ;
            camera.maxZ = parsedCamera.maxZ;

            camera.speed = parsedCamera.speed;
            camera.inertia = parsedCamera.inertia;

            camera.checkCollisions = parsedCamera.checkCollisions;
            camera.applyGravity = parsedCamera.applyGravity;
            if (parsedCamera.ellipsoid) {
                camera.ellipsoid = BABYLON.Vector3.FromArray(parsedCamera.ellipsoid);
            }

            // Animations
            if (parsedCamera.animations) {
                for (var animationIndex = 0; animationIndex < parsedCamera.animations.length; animationIndex++) {
                    var parsedAnimation = parsedCamera.animations[animationIndex];

                    camera.animations.push(parseAnimation(parsedAnimation));
                }
            }

            if (parsedCamera.autoAnimate) {
                scene.beginAnimation(camera, parsedCamera.autoAnimateFrom, parsedCamera.autoAnimateTo, parsedCamera.autoAnimateLoop, 1.0);
            }

            // Layer Mask
            if (parsedCamera.layerMask && (!isNaN(parsedCamera.layerMask))) {
                camera.layerMask = Math.abs(parseInt(parsedCamera.layerMask));
            } else {
                camera.layerMask = 0xFFFFFFFF;
            }

            return camera;
        };

        var parseGeometry = function (parsedGeometry, scene) {
            var id = parsedGeometry.id;
            return scene.getGeometryByID(id);
        };

        var parseBox = function (parsedBox, scene) {
            if (parseGeometry(parsedBox, scene)) {
                return null;
            }

            var box = new BABYLON.Geometry.Primitives.Box(parsedBox.id, scene, parsedBox.size, parsedBox.canBeRegenerated, null);
            BABYLON.Tags.AddTagsTo(box, parsedBox.tags);

            scene.pushGeometry(box, true);

            return box;
        };

        var parseSphere = function (parsedSphere, scene) {
            if (parseGeometry(parsedSphere, scene)) {
                return null;
            }

            var sphere = new BABYLON.Geometry.Primitives.Sphere(parsedSphere.id, scene, parsedSphere.segments, parsedSphere.diameter, parsedSphere.canBeRegenerated, null);
            BABYLON.Tags.AddTagsTo(sphere, parsedSphere.tags);

            scene.pushGeometry(sphere, true);

            return sphere;
        };

        var parseCylinder = function (parsedCylinder, scene) {
            if (parseGeometry(parsedCylinder, scene)) {
                return null;
            }

            var cylinder = new BABYLON.Geometry.Primitives.Cylinder(parsedCylinder.id, scene, parsedCylinder.height, parsedCylinder.diameterTop, parsedCylinder.diameterBottom, parsedCylinder.tessellation, parsedCylinder.subdivisions, parsedCylinder.canBeRegenerated, null);
            BABYLON.Tags.AddTagsTo(cylinder, parsedCylinder.tags);

            scene.pushGeometry(cylinder, true);

            return cylinder;
        };

        var parseTorus = function (parsedTorus, scene) {
            if (parseGeometry(parsedTorus, scene)) {
                return null;
            }

            var torus = new BABYLON.Geometry.Primitives.Torus(parsedTorus.id, scene, parsedTorus.diameter, parsedTorus.thickness, parsedTorus.tessellation, parsedTorus.canBeRegenerated, null);
            BABYLON.Tags.AddTagsTo(torus, parsedTorus.tags);

            scene.pushGeometry(torus, true);

            return torus;
        };

        var parseGround = function (parsedGround, scene) {
            if (parseGeometry(parsedGround, scene)) {
                return null;
            }

            var ground = new BABYLON.Geometry.Primitives.Ground(parsedGround.id, scene, parsedGround.width, parsedGround.height, parsedGround.subdivisions, parsedGround.canBeRegenerated, null);
            BABYLON.Tags.AddTagsTo(ground, parsedGround.tags);

            scene.pushGeometry(ground, true);

            return ground;
        };

        var parsePlane = function (parsedPlane, scene) {
            if (parseGeometry(parsedPlane, scene)) {
                return null;
            }

            var plane = new BABYLON.Geometry.Primitives.Plane(parsedPlane.id, scene, parsedPlane.size, parsedPlane.canBeRegenerated, null);
            BABYLON.Tags.AddTagsTo(plane, parsedPlane.tags);

            scene.pushGeometry(plane, true);

            return plane;
        };

        var parseTorusKnot = function (parsedTorusKnot, scene) {
            if (parseGeometry(parsedTorusKnot, scene)) {
                return null;
            }

            var torusKnot = new BABYLON.Geometry.Primitives.TorusKnot(parsedTorusKnot.id, scene, parsedTorusKnot.radius, parsedTorusKnot.tube, parsedTorusKnot.radialSegments, parsedTorusKnot.tubularSegments, parsedTorusKnot.p, parsedTorusKnot.q, parsedTorusKnot.canBeRegenerated, null);
            BABYLON.Tags.AddTagsTo(torusKnot, parsedTorusKnot.tags);

            scene.pushGeometry(torusKnot, true);

            return torusKnot;
        };

        var parseVertexData = function (parsedVertexData, scene, rootUrl) {
            if (parseGeometry(parsedVertexData, scene)) {
                return null;
            }

            var geometry = new BABYLON.Geometry(parsedVertexData.id, scene);

            BABYLON.Tags.AddTagsTo(geometry, parsedVertexData.tags);

            if (parsedVertexData.delayLoadingFile) {
                geometry.delayLoadState = BABYLON.Engine.DELAYLOADSTATE_NOTLOADED;
                geometry.delayLoadingFile = rootUrl + parsedVertexData.delayLoadingFile;
                geometry._boundingInfo = new BABYLON.BoundingInfo(BABYLON.Vector3.FromArray(parsedVertexData.boundingBoxMinimum), BABYLON.Vector3.FromArray(parsedVertexData.boundingBoxMaximum));

                geometry._delayInfo = [];
                if (parsedVertexData.hasUVs) {
                    geometry._delayInfo.push(BABYLON.VertexBuffer.UVKind);
                }

                if (parsedVertexData.hasUVs2) {
                    geometry._delayInfo.push(BABYLON.VertexBuffer.UV2Kind);
                }

                if (parsedVertexData.hasColors) {
                    geometry._delayInfo.push(BABYLON.VertexBuffer.ColorKind);
                }

                if (parsedVertexData.hasMatricesIndices) {
                    geometry._delayInfo.push(BABYLON.VertexBuffer.MatricesIndicesKind);
                }

                if (parsedVertexData.hasMatricesWeights) {
                    geometry._delayInfo.push(BABYLON.VertexBuffer.MatricesWeightsKind);
                }

                geometry._delayLoadingFunction = importVertexData;
            } else {
                importVertexData(parsedVertexData, geometry);
            }

            scene.pushGeometry(geometry, true);

            return geometry;
        };

        var parseMesh = function (parsedMesh, scene, rootUrl) {
            var mesh = new BABYLON.Mesh(parsedMesh.name, scene);
            mesh.id = parsedMesh.id;

            BABYLON.Tags.AddTagsTo(mesh, parsedMesh.tags);

            mesh.position = BABYLON.Vector3.FromArray(parsedMesh.position);

            if (parsedMesh.rotationQuaternion) {
                mesh.rotationQuaternion = BABYLON.Quaternion.FromArray(parsedMesh.rotationQuaternion);
            } else if (parsedMesh.rotation) {
                mesh.rotation = BABYLON.Vector3.FromArray(parsedMesh.rotation);
            }

            mesh.scaling = BABYLON.Vector3.FromArray(parsedMesh.scaling);

            if (parsedMesh.localMatrix) {
                mesh.setPivotMatrix(BABYLON.Matrix.FromArray(parsedMesh.localMatrix));
            } else if (parsedMesh.pivotMatrix) {
                mesh.setPivotMatrix(BABYLON.Matrix.FromArray(parsedMesh.pivotMatrix));
            }

            mesh.setEnabled(parsedMesh.isEnabled);
            mesh.isVisible = parsedMesh.isVisible;
            mesh.infiniteDistance = parsedMesh.infiniteDistance;

            mesh.showBoundingBox = parsedMesh.showBoundingBox;
            mesh.showSubMeshesBoundingBox = parsedMesh.showSubMeshesBoundingBox;

            if (parsedMesh.pickable !== undefined) {
                mesh.isPickable = parsedMesh.pickable;
            }

            mesh.receiveShadows = parsedMesh.receiveShadows;

            mesh.billboardMode = parsedMesh.billboardMode;

            if (parsedMesh.visibility !== undefined) {
                mesh.visibility = parsedMesh.visibility;
            }

            mesh.checkCollisions = parsedMesh.checkCollisions;
            mesh._shouldGenerateFlatShading = parsedMesh.useFlatShading;

            // Parent
            if (parsedMesh.parentId) {
                mesh._waitingParentId = parsedMesh.parentId;
            }

            // Geometry
            if (parsedMesh.delayLoadingFile) {
                mesh.delayLoadState = BABYLON.Engine.DELAYLOADSTATE_NOTLOADED;
                mesh.delayLoadingFile = rootUrl + parsedMesh.delayLoadingFile;
                mesh._boundingInfo = new BABYLON.BoundingInfo(BABYLON.Vector3.FromArray(parsedMesh.boundingBoxMinimum), BABYLON.Vector3.FromArray(parsedMesh.boundingBoxMaximum));

                if (parsedMesh._binaryInfo) {
                    mesh._binaryInfo = parsedMesh._binaryInfo;
                }

                mesh._delayInfo = [];
                if (parsedMesh.hasUVs) {
                    mesh._delayInfo.push(BABYLON.VertexBuffer.UVKind);
                }

                if (parsedMesh.hasUVs2) {
                    mesh._delayInfo.push(BABYLON.VertexBuffer.UV2Kind);
                }

                if (parsedMesh.hasColors) {
                    mesh._delayInfo.push(BABYLON.VertexBuffer.ColorKind);
                }

                if (parsedMesh.hasMatricesIndices) {
                    mesh._delayInfo.push(BABYLON.VertexBuffer.MatricesIndicesKind);
                }

                if (parsedMesh.hasMatricesWeights) {
                    mesh._delayInfo.push(BABYLON.VertexBuffer.MatricesWeightsKind);
                }

                mesh._delayLoadingFunction = importGeometry;

                if (BABYLON.SceneLoader.ForceFullSceneLoadingForIncremental) {
                    mesh._checkDelayState();
                }
            } else {
                importGeometry(parsedMesh, mesh);
            }

            // Material
            if (parsedMesh.materialId) {
                mesh.setMaterialByID(parsedMesh.materialId);
            } else {
                mesh.material = null;
            }

            // Skeleton
            if (parsedMesh.skeletonId > -1) {
                mesh.skeleton = scene.getLastSkeletonByID(parsedMesh.skeletonId);
            }

            // Physics
            if (parsedMesh.physicsImpostor) {
                if (!scene.isPhysicsEnabled()) {
                    scene.enablePhysics();
                }

                mesh.setPhysicsState({ impostor: parsedMesh.physicsImpostor, mass: parsedMesh.physicsMass, friction: parsedMesh.physicsFriction, restitution: parsedMesh.physicsRestitution });
            }

            // Animations
            if (parsedMesh.animations) {
                for (var animationIndex = 0; animationIndex < parsedMesh.animations.length; animationIndex++) {
                    var parsedAnimation = parsedMesh.animations[animationIndex];

                    mesh.animations.push(parseAnimation(parsedAnimation));
                }
            }

            if (parsedMesh.autoAnimate) {
                scene.beginAnimation(mesh, parsedMesh.autoAnimateFrom, parsedMesh.autoAnimateTo, parsedMesh.autoAnimateLoop, 1.0);
            }

            // Layer Mask
            if (parsedMesh.layerMask && (!isNaN(parsedMesh.layerMask))) {
                mesh.layerMask = Math.abs(parseInt(parsedMesh.layerMask));
            } else {
                mesh.layerMask = 0xFFFFFFFF;
            }

            // Instances
            if (parsedMesh.instances) {
                for (var index = 0; index < parsedMesh.instances.length; index++) {
                    var parsedInstance = parsedMesh.instances[index];
                    var instance = mesh.createInstance(parsedInstance.name);

                    BABYLON.Tags.AddTagsTo(instance, parsedInstance.tags);

                    instance.position = BABYLON.Vector3.FromArray(parsedInstance.position);

                    if (parsedInstance.rotationQuaternion) {
                        instance.rotationQuaternion = BABYLON.Quaternion.FromArray(parsedInstance.rotationQuaternion);
                    } else if (parsedInstance.rotation) {
                        instance.rotation = BABYLON.Vector3.FromArray(parsedInstance.rotation);
                    }

                    instance.scaling = BABYLON.Vector3.FromArray(parsedInstance.scaling);

                    instance.checkCollisions = mesh.checkCollisions;

                    if (parsedMesh.animations) {
                        for (animationIndex = 0; animationIndex < parsedMesh.animations.length; animationIndex++) {
                            parsedAnimation = parsedMesh.animations[animationIndex];

                            instance.animations.push(parseAnimation(parsedAnimation));
                        }
                    }
                }
            }

            return mesh;
        };

        var isDescendantOf = function (mesh, names, hierarchyIds) {
            names = (names instanceof Array) ? names : [names];
            for (var i in names) {
                if (mesh.name === names[i]) {
                    hierarchyIds.push(mesh.id);
                    return true;
                }
            }

            if (mesh.parentId && hierarchyIds.indexOf(mesh.parentId) !== -1) {
                hierarchyIds.push(mesh.id);
                return true;
            }

            return false;
        };

        var importVertexData = function (parsedVertexData, geometry) {
            var vertexData = new BABYLON.VertexData();

            // positions
            var positions = parsedVertexData.positions;
            if (positions) {
                vertexData.set(positions, BABYLON.VertexBuffer.PositionKind);
            }

            // normals
            var normals = parsedVertexData.normals;
            if (normals) {
                vertexData.set(normals, BABYLON.VertexBuffer.NormalKind);
            }

            // uvs
            var uvs = parsedVertexData.uvs;
            if (uvs) {
                vertexData.set(uvs, BABYLON.VertexBuffer.UVKind);
            }

            // uv2s
            var uv2s = parsedVertexData.uv2s;
            if (uv2s) {
                vertexData.set(uv2s, BABYLON.VertexBuffer.UV2Kind);
            }

            // colors
            var colors = parsedVertexData.colors;
            if (colors) {
                vertexData.set(colors, BABYLON.VertexBuffer.ColorKind);
            }

            // matricesIndices
            var matricesIndices = parsedVertexData.matricesIndices;
            if (matricesIndices) {
                vertexData.set(matricesIndices, BABYLON.VertexBuffer.MatricesIndicesKind);
            }

            // matricesWeights
            var matricesWeights = parsedVertexData.matricesWeights;
            if (matricesWeights) {
                vertexData.set(matricesWeights, BABYLON.VertexBuffer.MatricesWeightsKind);
            }

            // indices
            var indices = parsedVertexData.indices;
            if (indices) {
                vertexData.indices = indices;
            }

            geometry.setAllVerticesData(vertexData, parsedVertexData.updatable);
        };

        var importGeometry = function (parsedGeometry, mesh) {
            var scene = mesh.getScene();

            // Geometry
            var geometryId = parsedGeometry.geometryId;
            if (geometryId) {
                var geometry = scene.getGeometryByID(geometryId);
                if (geometry) {
                    geometry.applyToMesh(mesh);
                }
            } else if (parsedGeometry instanceof ArrayBuffer) {
                var binaryInfo = mesh._binaryInfo;

                if (binaryInfo.positionsAttrDesc && binaryInfo.positionsAttrDesc.count > 0) {
                    var positionsData = new Float32Array(parsedGeometry, binaryInfo.positionsAttrDesc.offset, binaryInfo.positionsAttrDesc.count);
                    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positionsData, false);
                }

                if (binaryInfo.normalsAttrDesc && binaryInfo.normalsAttrDesc.count > 0) {
                    var normalsData = new Float32Array(parsedGeometry, binaryInfo.normalsAttrDesc.offset, binaryInfo.normalsAttrDesc.count);
                    mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normalsData, false);
                }

                if (binaryInfo.uvsAttrDesc && binaryInfo.uvsAttrDesc.count > 0) {
                    var uvsData = new Float32Array(parsedGeometry, binaryInfo.uvsAttrDesc.offset, binaryInfo.uvsAttrDesc.count);
                    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvsData, false);
                }

                if (binaryInfo.uvs2AttrDesc && binaryInfo.uvs2AttrDesc.count > 0) {
                    var uvs2Data = new Float32Array(parsedGeometry, binaryInfo.uvs2AttrDesc.offset, binaryInfo.uvs2AttrDesc.count);
                    mesh.setVerticesData(BABYLON.VertexBuffer.UV2Kind, uvs2Data, false);
                }

                if (binaryInfo.colorsAttrDesc && binaryInfo.colorsAttrDesc.count > 0) {
                    var colorsData = new Float32Array(parsedGeometry, binaryInfo.colorsAttrDesc.offset, binaryInfo.colorsAttrDesc.count);
                    mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colorsData, false);
                }

                if (binaryInfo.matricesIndicesAttrDesc && binaryInfo.matricesIndicesAttrDesc.count > 0) {
                    var matricesIndicesData = new Int32Array(parsedGeometry, binaryInfo.matricesIndicesAttrDesc.offset, binaryInfo.matricesIndicesAttrDesc.count);
                    mesh.setVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind, matricesIndicesData, false);
                }

                if (binaryInfo.matricesWeightsAttrDesc && binaryInfo.matricesWeightsAttrDesc.count > 0) {
                    var matricesWeightsData = new Float32Array(parsedGeometry, binaryInfo.matricesWeightsAttrDesc.offset, binaryInfo.matricesWeightsAttrDesc.count);
                    mesh.setVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind, matricesWeightsData, false);
                }

                if (binaryInfo.indicesAttrDesc && binaryInfo.indicesAttrDesc.count > 0) {
                    var indicesData = new Int32Array(parsedGeometry, binaryInfo.indicesAttrDesc.offset, binaryInfo.indicesAttrDesc.count);
                    mesh.setIndices(indicesData);
                }

                if (binaryInfo.subMeshesAttrDesc && binaryInfo.subMeshesAttrDesc.count > 0) {
                    var subMeshesData = new Int32Array(parsedGeometry, binaryInfo.subMeshesAttrDesc.offset, binaryInfo.subMeshesAttrDesc.count * 5);

                    mesh.subMeshes = [];
                    for (var i = 0; i < binaryInfo.subMeshesAttrDesc.count; i++) {
                        var materialIndex = subMeshesData[(i * 5) + 0];
                        var verticesStart = subMeshesData[(i * 5) + 1];
                        var verticesCount = subMeshesData[(i * 5) + 2];
                        var indexStart = subMeshesData[(i * 5) + 3];
                        var indexCount = subMeshesData[(i * 5) + 4];

                        var subMesh = new BABYLON.SubMesh(materialIndex, verticesStart, verticesCount, indexStart, indexCount, mesh);
                    }
                }
            } else if (parsedGeometry.positions && parsedGeometry.normals && parsedGeometry.indices) {
                mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, parsedGeometry.positions, false);
                mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, parsedGeometry.normals, false);

                if (parsedGeometry.uvs) {
                    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, parsedGeometry.uvs, false);
                }

                if (parsedGeometry.uvs2) {
                    mesh.setVerticesData(BABYLON.VertexBuffer.UV2Kind, parsedGeometry.uvs2, false);
                }

                if (parsedGeometry.colors) {
                    mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, parsedGeometry.colors, false);
                }

                if (parsedGeometry.matricesIndices) {
                    if (!parsedGeometry.matricesIndices._isExpanded) {
                        var floatIndices = [];

                        for (var i = 0; i < parsedGeometry.matricesIndices.length; i++) {
                            var matricesIndex = parsedGeometry.matricesIndices[i];

                            floatIndices.push(matricesIndex & 0x000000FF);
                            floatIndices.push((matricesIndex & 0x0000FF00) >> 8);
                            floatIndices.push((matricesIndex & 0x00FF0000) >> 16);
                            floatIndices.push(matricesIndex >> 24);
                        }

                        mesh.setVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind, floatIndices, false);
                    } else {
                        delete parsedGeometry.matricesIndices._isExpanded;
                        mesh.setVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind, parsedGeometry.matricesIndices, false);
                    }
                }

                if (parsedGeometry.matricesWeights) {
                    mesh.setVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind, parsedGeometry.matricesWeights, false);
                }

                mesh.setIndices(parsedGeometry.indices);

                // SubMeshes
                if (parsedGeometry.subMeshes) {
                    mesh.subMeshes = [];
                    for (var subIndex = 0; subIndex < parsedGeometry.subMeshes.length; subIndex++) {
                        var parsedSubMesh = parsedGeometry.subMeshes[subIndex];

                        var subMesh = new BABYLON.SubMesh(parsedSubMesh.materialIndex, parsedSubMesh.verticesStart, parsedSubMesh.verticesCount, parsedSubMesh.indexStart, parsedSubMesh.indexCount, mesh);
                    }
                }
            }

            // Flat shading
            if (mesh._shouldGenerateFlatShading) {
                mesh.convertToFlatShadedMesh();
                delete mesh._shouldGenerateFlatShading;
            }

            // Update
            mesh.computeWorldMatrix(true);

            // Octree
            if (scene._selectionOctree) {
                scene._selectionOctree.addMesh(mesh);
            }
        };

        BABYLON.SceneLoader.RegisterPlugin({
            extensions: ".babylon",
            importMesh: function (meshesNames, scene, data, rootUrl, meshes, particleSystems, skeletons) {
                var parsedData = JSON.parse(data);

                var loadedSkeletonsIds = [];
                var loadedMaterialsIds = [];
                var hierarchyIds = [];
                for (var index = 0; index < parsedData.meshes.length; index++) {
                    var parsedMesh = parsedData.meshes[index];

                    if (!meshesNames || isDescendantOf(parsedMesh, meshesNames, hierarchyIds)) {
                        if (meshesNames instanceof Array) {
                            // Remove found mesh name from list.
                            delete meshesNames[meshesNames.indexOf(parsedMesh.name)];
                        }

                        // Material ?
                        if (parsedMesh.materialId) {
                            var materialFound = (loadedMaterialsIds.indexOf(parsedMesh.materialId) !== -1);

                            if (!materialFound) {
                                for (var multimatIndex = 0; multimatIndex < parsedData.multiMaterials.length; multimatIndex++) {
                                    var parsedMultiMaterial = parsedData.multiMaterials[multimatIndex];
                                    if (parsedMultiMaterial.id == parsedMesh.materialId) {
                                        for (var matIndex = 0; matIndex < parsedMultiMaterial.materials.length; matIndex++) {
                                            var subMatId = parsedMultiMaterial.materials[matIndex];
                                            loadedMaterialsIds.push(subMatId);
                                            parseMaterialById(subMatId, parsedData, scene, rootUrl);
                                        }

                                        loadedMaterialsIds.push(parsedMultiMaterial.id);
                                        parseMultiMaterial(parsedMultiMaterial, scene);
                                        materialFound = true;
                                        break;
                                    }
                                }
                            }

                            if (!materialFound) {
                                loadedMaterialsIds.push(parsedMesh.materialId);
                                parseMaterialById(parsedMesh.materialId, parsedData, scene, rootUrl);
                            }
                        }

                        // Skeleton ?
                        if (parsedMesh.skeletonId > -1 && scene.skeletons) {
                            var skeletonAlreadyLoaded = (loadedSkeletonsIds.indexOf(parsedMesh.skeletonId) > -1);

                            if (!skeletonAlreadyLoaded) {
                                for (var skeletonIndex = 0; skeletonIndex < parsedData.skeletons.length; skeletonIndex++) {
                                    var parsedSkeleton = parsedData.skeletons[skeletonIndex];

                                    if (parsedSkeleton.id === parsedMesh.skeletonId) {
                                        skeletons.push(parseSkeleton(parsedSkeleton, scene));
                                        loadedSkeletonsIds.push(parsedSkeleton.id);
                                    }
                                }
                            }
                        }

                        var mesh = parseMesh(parsedMesh, scene, rootUrl);
                        meshes.push(mesh);
                    }
                }

                for (index = 0; index < scene.meshes.length; index++) {
                    var currentMesh = scene.meshes[index];
                    if (currentMesh._waitingParentId) {
                        currentMesh.parent = scene.getLastEntryByID(currentMesh._waitingParentId);
                        currentMesh._waitingParentId = undefined;
                    }
                }

                // Particles
                if (parsedData.particleSystems) {
                    for (index = 0; index < parsedData.particleSystems.length; index++) {
                        var parsedParticleSystem = parsedData.particleSystems[index];

                        if (hierarchyIds.indexOf(parsedParticleSystem.emitterId) !== -1) {
                            particleSystems.push(parseParticleSystem(parsedParticleSystem, scene, rootUrl));
                        }
                    }
                }

                return true;
            },
            load: function (scene, data, rootUrl) {
                var parsedData = JSON.parse(data);

                // Scene
                scene.useDelayedTextureLoading = parsedData.useDelayedTextureLoading && !BABYLON.SceneLoader.ForceFullSceneLoadingForIncremental;
                scene.autoClear = parsedData.autoClear;
                scene.clearColor = BABYLON.Color3.FromArray(parsedData.clearColor);
                scene.ambientColor = BABYLON.Color3.FromArray(parsedData.ambientColor);
                scene.gravity = BABYLON.Vector3.FromArray(parsedData.gravity);

                // Fog
                if (parsedData.fogMode && parsedData.fogMode !== 0) {
                    scene.fogMode = parsedData.fogMode;
                    scene.fogColor = BABYLON.Color3.FromArray(parsedData.fogColor);
                    scene.fogStart = parsedData.fogStart;
                    scene.fogEnd = parsedData.fogEnd;
                    scene.fogDensity = parsedData.fogDensity;
                }

                for (var index = 0; index < parsedData.lights.length; index++) {
                    var parsedLight = parsedData.lights[index];
                    parseLight(parsedLight, scene);
                }

                // Materials
                if (parsedData.materials) {
                    for (index = 0; index < parsedData.materials.length; index++) {
                        var parsedMaterial = parsedData.materials[index];
                        parseMaterial(parsedMaterial, scene, rootUrl);
                    }
                }

                if (parsedData.multiMaterials) {
                    for (index = 0; index < parsedData.multiMaterials.length; index++) {
                        var parsedMultiMaterial = parsedData.multiMaterials[index];
                        parseMultiMaterial(parsedMultiMaterial, scene);
                    }
                }

                // Skeletons
                if (parsedData.skeletons) {
                    for (index = 0; index < parsedData.skeletons.length; index++) {
                        var parsedSkeleton = parsedData.skeletons[index];
                        parseSkeleton(parsedSkeleton, scene);
                    }
                }

                // Geometries
                var geometries = parsedData.geometries;
                if (geometries) {
                    // Boxes
                    var boxes = geometries.boxes;
                    if (boxes) {
                        for (index = 0; index < boxes.length; index++) {
                            var parsedBox = boxes[index];
                            parseBox(parsedBox, scene);
                        }
                    }

                    // Spheres
                    var spheres = geometries.spheres;
                    if (spheres) {
                        for (index = 0; index < spheres.length; index++) {
                            var parsedSphere = spheres[index];
                            parseSphere(parsedSphere, scene);
                        }
                    }

                    // Cylinders
                    var cylinders = geometries.cylinders;
                    if (cylinders) {
                        for (index = 0; index < cylinders.length; index++) {
                            var parsedCylinder = cylinders[index];
                            parseCylinder(parsedCylinder, scene);
                        }
                    }

                    // Toruses
                    var toruses = geometries.toruses;
                    if (toruses) {
                        for (index = 0; index < toruses.length; index++) {
                            var parsedTorus = toruses[index];
                            parseTorus(parsedTorus, scene);
                        }
                    }

                    // Grounds
                    var grounds = geometries.grounds;
                    if (grounds) {
                        for (index = 0; index < grounds.length; index++) {
                            var parsedGround = grounds[index];
                            parseGround(parsedGround, scene);
                        }
                    }

                    // Planes
                    var planes = geometries.planes;
                    if (planes) {
                        for (index = 0; index < planes.length; index++) {
                            var parsedPlane = planes[index];
                            parsePlane(parsedPlane, scene);
                        }
                    }

                    // TorusKnots
                    var torusKnots = geometries.torusKnots;
                    if (torusKnots) {
                        for (index = 0; index < torusKnots.length; index++) {
                            var parsedTorusKnot = torusKnots[index];
                            parseTorusKnot(parsedTorusKnot, scene);
                        }
                    }

                    // VertexData
                    var vertexData = geometries.vertexData;
                    if (vertexData) {
                        for (index = 0; index < vertexData.length; index++) {
                            var parsedVertexData = vertexData[index];
                            parseVertexData(parsedVertexData, scene, rootUrl);
                        }
                    }
                }

                for (index = 0; index < parsedData.meshes.length; index++) {
                    var parsedMesh = parsedData.meshes[index];
                    parseMesh(parsedMesh, scene, rootUrl);
                }

                for (index = 0; index < parsedData.cameras.length; index++) {
                    var parsedCamera = parsedData.cameras[index];
                    parseCamera(parsedCamera, scene);
                }

                if (parsedData.activeCameraID) {
                    scene.setActiveCameraByID(parsedData.activeCameraID);
                }

                for (index = 0; index < scene.cameras.length; index++) {
                    var camera = scene.cameras[index];
                    if (camera._waitingParentId) {
                        camera.parent = scene.getLastEntryByID(camera._waitingParentId);
                        camera._waitingParentId = undefined;
                    }
                }

                for (index = 0; index < scene.meshes.length; index++) {
                    var mesh = scene.meshes[index];
                    if (mesh._waitingParentId) {
                        mesh.parent = scene.getLastEntryByID(mesh._waitingParentId);
                        mesh._waitingParentId = undefined;
                    }
                }

                // Particles Systems
                if (parsedData.particleSystems) {
                    for (index = 0; index < parsedData.particleSystems.length; index++) {
                        var parsedParticleSystem = parsedData.particleSystems[index];
                        parseParticleSystem(parsedParticleSystem, scene, rootUrl);
                    }
                }

                // Lens flares
                if (parsedData.lensFlareSystems) {
                    for (index = 0; index < parsedData.lensFlareSystems.length; index++) {
                        var parsedLensFlareSystem = parsedData.lensFlareSystems[index];
                        parseLensFlareSystem(parsedLensFlareSystem, scene, rootUrl);
                    }
                }

                // Shadows
                if (parsedData.shadowGenerators) {
                    for (index = 0; index < parsedData.shadowGenerators.length; index++) {
                        var parsedShadowGenerator = parsedData.shadowGenerators[index];

                        parseShadowGenerator(parsedShadowGenerator, scene);
                    }
                }

                // Finish
                return true;
            }
        });
    })(BABYLON.Internals || (BABYLON.Internals = {}));
    var Internals = BABYLON.Internals;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=babylon.babylonFileLoader.js.map
