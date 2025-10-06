var createScene = function () {

    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);


    var cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {height: 3, diameter: 1.5}, scene);
    cylinder.position.x = -2;
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2.5}, scene);
    sphere.position.x = 2;


    const vertexShader = `
        precision highp float;

        // Attributes
        attribute vec3 position;
        attribute vec3 normal;

        // Uniforms
        uniform mat4 worldViewProjection;
        uniform mat4 world;

        // Varying
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main(void) {
            vPosition = (world * vec4(position, 1.0)).xyz;
            vNormal = normalize(mat3(world) * normal);
            gl_Position = worldViewProjection * vec4(position, 1.0);
        }
    `;


    const fragmentShader = `
        precision highp float;

        // Varying
        varying vec3 vPosition;
        varying vec3 vNormal;

        // Uniforms
        uniform vec3 uMatAmbient;
        uniform vec3 uMatDiffuse;
        uniform vec3 uMatSpecular;
        uniform float uMatShininess;

        uniform vec3 uViewPosition; // Camera position

       
        uniform vec3 uPointLightPos;
        uniform vec3 uPointLightColor;

     
        uniform vec3 uPointLight2Pos;
        uniform vec3 uPointLight2Color;

      
        vec3 shadePointLight(vec3 pLightPos, vec3 pLightColor, vec3 pMatAmbient, vec3 pMatDiffuse, vec3 pMatSpecular, float pMatShininess) {
            vec3 normal = normalize(vNormal);
            vec3 lightDir = normalize(pLightPos - vPosition);
            vec3 viewDir = normalize(uViewPosition - vPosition);
            vec3 reflectDir = reflect(-lightDir, normal);

            vec3 ambient = pMatAmbient * pLightColor;
            float diffFactor = max(dot(normal, lightDir), 0.0);
            vec3 diffuse = pMatDiffuse * pLightColor * diffFactor;
            float specFactor = pow(max(dot(viewDir, reflectDir), 0.0), pMatShininess);
            vec3 specular = pMatSpecular * pLightColor * specFactor;

            return (ambient + diffuse + specular);
        }

        void main(void) {
            vec3 finalColor = vec3(0.0, 0.0, 0.0);

            finalColor += shadePointLight(uPointLightPos, uPointLightColor, uMatAmbient, uMatDiffuse, uMatSpecular, uMatShininess);

     
            finalColor += shadePointLight(uPointLight2Pos, uPointLight2Color, uMatAmbient, uMatDiffuse, uMatSpecular, uMatShininess);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;


    var shaderMaterial = new BABYLON.ShaderMaterial("phongShader", scene, {
        vertexSource: vertexShader,
        fragmentSource: fragmentShader,
    }, {
        attributes: ["position", "normal"],
        uniforms: [
            "world", "worldViewProjection", "uViewPosition",
            "uMatAmbient", "uMatDiffuse", "uMatSpecular", "uMatShininess",
            "uPointLightPos", "uPointLightColor",
            "uPointLight2Pos", "uPointLight2Color"
        ]
    });


    shaderMaterial.setColor3("uMatAmbient", new BABYLON.Color3(0.1, 0.1, 0.1));
    shaderMaterial.setColor3("uMatDiffuse", new BABYLON.Color3(0.1, 0.2, 0.8));
    shaderMaterial.setColor3("uMatSpecular", new BABYLON.Color3(1.0, 1.0, 1.0));
    shaderMaterial.setFloat("uMatShininess", 50.0);


    shaderMaterial.setVector3("uViewPosition", camera.position);

    shaderMaterial.setVector3("uPointLightPos", new BABYLON.Vector3(5, 5, -5));
    shaderMaterial.setColor3("uPointLightColor", new BABYLON.Color3(1.0, 1.0, 1.0));


    //shaderMaterial.setVector3("uPointLight2Pos", new BABYLON.Vector3(-5, 3, -3));
    //shaderMaterial.setColor3("uPointLight2Color", new BABYLON.Color3(0.0, 1.0, 0.0));

    cylinder.material = shaderMaterial;
    sphere.material = shaderMaterial;

    return scene;
};