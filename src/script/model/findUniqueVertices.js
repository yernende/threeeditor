export function findUniqueVertices(mesh, wireframe) {
  const equalityThreshold = 1e-3;
  const vertices = [];

  const meshPositionArray = mesh.geometry.attributes.position.array;
  const wireframePositionArray = wireframe.geometry.attributes.position.array;

  positionsArrayLoop:
  for (let i = 0; i < meshPositionArray.length; i += 3) {
    const coords = meshPositionArray.slice(i, i + 3);

    for (let vertex of vertices) {
      if (Math.abs(vertex.coords[0] - coords[0]) <= equalityThreshold
        && Math.abs(vertex.coords[1] - coords[1]) <= equalityThreshold
        && Math.abs(vertex.coords[2] - coords[2]) <= equalityThreshold
      ) {
        vertex.meshIndices.push(i);
        continue positionsArrayLoop;
      }
    }

    vertices.push({
      coords: meshPositionArray.slice(i, i + 3),
      meshIndices: [i],
      wireframeIndices: []
    });
  }

  for (let i = 0; i < wireframePositionArray.length; i += 3) {
    const coords = wireframePositionArray.slice(i, i + 3);

    for (let vertex of vertices) {
      if (Math.abs(vertex.coords[0] - coords[0]) <= equalityThreshold
        && Math.abs(vertex.coords[1] - coords[1]) <= equalityThreshold
        && Math.abs(vertex.coords[2] - coords[2]) <= equalityThreshold
      ) {
        vertex.wireframeIndices.push(i);
        break;
      }
    }
  }

  return vertices;
}
