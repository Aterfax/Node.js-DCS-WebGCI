module.exports = {
    PushToArray: function (arr, obj) {
    const index = arr.findIndex((e) => e.name === obj.name);
    if (index === -1) {
        arr.push(obj);
    } else {
        Object.assign(arr[index], obj);
    }
    return arr;
    },
    RemoveNonTypeEntities: function (arr) {
    const index = arr.findIndex((e) => e.Type == null);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
  }
};
