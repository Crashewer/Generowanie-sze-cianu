const vertexShaderTxt = 
`
    precision mediump float;

    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProjection;
    
    attribute vec3 vertPosition;
    attribute vec3 vertColor;

    varying vec3 fragColor;

    void main() {
        fragColor = vertColor;
        gl_Position = mProjection * mView * mWorld * vec4(vertPosition, 1.0);
    }
`;
const fragmentShaderTxt = 
`
    precision mediump float;

    varying vec3 fragColor;

    void main() {
        gl_FragColor = vec4(fragColor, 1.0);
    }
`;

const mat4 = glMatrix.mat4;

const Cubes = function ()
{
    const canvas = document.getElementById('main-canvas');
    const gl = canvas.getContext('webgl');
    let canvasColor = [0.2, 0.5, 0.8];

    checkGl(gl);

    gl.clearColor(...canvasColor, 1.0);   // R, G, B,  A 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    checkShaderCompile(gl, vertexShader);
    checkShaderCompile(gl, fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    checkLink(gl, program);

    gl.validateProgram(program);

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);

    let x_pos = (Math.random() * 4.0) - 2.0;
    let y_pos = (Math.random() * 4.0) - 2.0;
    let z_pos = (Math.random() * 4.0) - 2.0;
    let scale = Math.random() * 0.5 + 0.1;

    const boxColors =
    [
        0.0, 1.0, 1.0,  // Cyan 
        0.0, 0.0, 1.0,  // Blue
        0.0, 1.0, 1.0,  // Cyan
        1.0, 0.0, 1.0,  // Magenta
        1.0, 0.0, 1.0,  // Magenta
        0.0, 1.0, 1.0,  // Cyan
        1.0, 0.0, 1.0,  // Magenta
        1.0, 0.0, 0.0   // Red
    ];

    const { vertices, indices } = generateCubeVerts(x_pos, y_pos, z_pos, scale);

    const boxVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const boxColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxColors), gl.STATIC_DRAW);

    const boxIndicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    const posAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertBuffer);
    gl.vertexAttribPointer
    (
        posAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        0,
        0
    );
    gl.enableVertexAttribArray(posAttribLocation);

    const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.bindBuffer(gl.ARRAY_BUFFER, boxColorBuffer);
    gl.vertexAttribPointer
    (
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        0,
        0
    );
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);
    
    const worldMatLoc = gl.getUniformLocation(program, 'mWorld');
    const viewMatLoc = gl.getUniformLocation(program, 'mView');
    const projectionMatLoc = gl.getUniformLocation(program, 'mProjection');

    const worldMatrix = mat4.create();
    
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 0, -6], [0, 0, 0], [0, 1, 0]);
    
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(worldMatLoc, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewMatLoc, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projectionMatLoc, gl.FALSE, projectionMatrix);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
};

function checkGl(gl)
{
    if (!gl)
    {
        console.log('WebGL not supported, use another browser');
    }
}

function checkShaderCompile(gl, shader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.error('Shader not compiled', gl.getShaderInfoLog(shader));
    }
}

function checkLink(gl, program)
{
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error('Linking error', gl.getProgramInfoLog(program));
    }
}

function generateCubeVerts(x_pos, y_pos, z_pos, scaling_factor)
{
    const vec3 = glMatrix.vec3;
    const mat4 = glMatrix.mat4;

    const unitCubeVerts =
    [
        -1.0,  1.0,  1.0, // 0
         1.0,  1.0,  1.0, // 1
         1.0, -1.0,  1.0, // 2
        -1.0, -1.0,  1.0, // 3
        -1.0,  1.0, -1.0, // 4
         1.0,  1.0, -1.0, // 5
         1.0, -1.0, -1.0, // 6
        -1.0, -1.0, -1.0  // 7
    ];

    const boxIndices =
    [
        // Front
        4, 5, 6,   4, 6, 7,
        // Back
        0, 2, 1,   0, 3, 2,
        // Top
        1, 5, 0,   0, 5, 4,
        // Bottom
        3, 6, 2,   3, 7, 6,
        // Left
        1, 2, 5,   5, 2, 6,
        // Right
        0, 4, 3,   4, 7, 3
    ];

    const scaledTranslatedVerts = [];
    
    const scaleMatrix = mat4.create();
    mat4.scale(scaleMatrix, scaleMatrix, [scaling_factor, scaling_factor, scaling_factor]);
    
    const translationMatrix = mat4.create();
    mat4.translate(translationMatrix, translationMatrix, [x_pos, y_pos, z_pos]);

    for (let i = 0; i < unitCubeVerts.length; i += 3)
    {
        let vert = vec3.fromValues
        (
            unitCubeVerts[i],
            unitCubeVerts[i + 1],
            unitCubeVerts[i + 2]
        );
        vec3.transformMat4(vert, vert, scaleMatrix);
        vec3.transformMat4(vert, vert, translationMatrix);

        scaledTranslatedVerts.push(vert[0], vert[1], vert[2]);
    }

    return {
        vertices: scaledTranslatedVerts,
        indices: boxIndices
    };
}