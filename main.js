var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// node_modules/umap-js/dist/utils.js
var require_utils = __commonJS({
  "node_modules/umap-js/dist/utils.js"(exports) {
    "use strict";
    var __values = exports && exports.__values || function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m)
        return m.call(o);
      if (o && typeof o.length === "number")
        return {
          next: function() {
            if (o && i >= o.length)
              o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reshape2d = exports.rejectionSample = exports.max2d = exports.max = exports.mean = exports.sum = exports.linear = exports.ones = exports.zeros = exports.filled = exports.range = exports.empty = exports.norm = exports.tauRand = exports.tauRandInt = void 0;
    function tauRandInt(n, random) {
      return Math.floor(random() * n);
    }
    exports.tauRandInt = tauRandInt;
    function tauRand(random) {
      return random();
    }
    exports.tauRand = tauRand;
    function norm(vec) {
      var e_1, _a;
      var result = 0;
      try {
        for (var vec_1 = __values(vec), vec_1_1 = vec_1.next(); !vec_1_1.done; vec_1_1 = vec_1.next()) {
          var item = vec_1_1.value;
          result += Math.pow(item, 2);
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (vec_1_1 && !vec_1_1.done && (_a = vec_1.return))
            _a.call(vec_1);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
      return Math.sqrt(result);
    }
    exports.norm = norm;
    function empty(n) {
      var output = [];
      for (var i = 0; i < n; i++) {
        output.push(void 0);
      }
      return output;
    }
    exports.empty = empty;
    function range(n) {
      return empty(n).map(function(_, i) {
        return i;
      });
    }
    exports.range = range;
    function filled(n, v) {
      return empty(n).map(function() {
        return v;
      });
    }
    exports.filled = filled;
    function zeros(n) {
      return filled(n, 0);
    }
    exports.zeros = zeros;
    function ones(n) {
      return filled(n, 1);
    }
    exports.ones = ones;
    function linear(a, b, len) {
      return empty(len).map(function(_, i) {
        return a + i * ((b - a) / (len - 1));
      });
    }
    exports.linear = linear;
    function sum(input) {
      return input.reduce(function(sum2, val) {
        return sum2 + val;
      });
    }
    exports.sum = sum;
    function mean(input) {
      return sum(input) / input.length;
    }
    exports.mean = mean;
    function max(input) {
      var max2 = 0;
      for (var i = 0; i < input.length; i++) {
        max2 = input[i] > max2 ? input[i] : max2;
      }
      return max2;
    }
    exports.max = max;
    function max2d(input) {
      var max2 = 0;
      for (var i = 0; i < input.length; i++) {
        for (var j = 0; j < input[i].length; j++) {
          max2 = input[i][j] > max2 ? input[i][j] : max2;
        }
      }
      return max2;
    }
    exports.max2d = max2d;
    function rejectionSample(nSamples, poolSize, random) {
      var result = zeros(nSamples);
      for (var i = 0; i < nSamples; i++) {
        var rejectSample = true;
        while (rejectSample) {
          var j = tauRandInt(poolSize, random);
          var broken = false;
          for (var k = 0; k < i; k++) {
            if (j === result[k]) {
              broken = true;
              break;
            }
          }
          if (!broken) {
            rejectSample = false;
          }
          result[i] = j;
        }
      }
      return result;
    }
    exports.rejectionSample = rejectionSample;
    function reshape2d(x, a, b) {
      var rows = [];
      var count = 0;
      var index = 0;
      if (x.length !== a * b) {
        throw new Error("Array dimensions must match input length.");
      }
      for (var i = 0; i < a; i++) {
        var col = [];
        for (var j = 0; j < b; j++) {
          col.push(x[index]);
          index += 1;
        }
        rows.push(col);
        count += 1;
      }
      return rows;
    }
    exports.reshape2d = reshape2d;
  }
});

// node_modules/umap-js/dist/heap.js
var require_heap = __commonJS({
  "node_modules/umap-js/dist/heap.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.smallestFlagged = exports.deheapSort = exports.buildCandidates = exports.uncheckedHeapPush = exports.heapPush = exports.rejectionSample = exports.makeHeap = void 0;
    var utils = __importStar(require_utils());
    function makeHeap(nPoints, size) {
      var makeArrays = function(fillValue) {
        return utils.empty(nPoints).map(function() {
          return utils.filled(size, fillValue);
        });
      };
      var heap = [];
      heap.push(makeArrays(-1));
      heap.push(makeArrays(Infinity));
      heap.push(makeArrays(0));
      return heap;
    }
    exports.makeHeap = makeHeap;
    function rejectionSample(nSamples, poolSize, random) {
      var result = utils.zeros(nSamples);
      for (var i = 0; i < nSamples; i++) {
        var rejectSample = true;
        var j = 0;
        while (rejectSample) {
          j = utils.tauRandInt(poolSize, random);
          var broken = false;
          for (var k = 0; k < i; k++) {
            if (j === result[k]) {
              broken = true;
              break;
            }
          }
          if (!broken)
            rejectSample = false;
        }
        result[i] = j;
      }
      return result;
    }
    exports.rejectionSample = rejectionSample;
    function heapPush(heap, row, weight, index, flag) {
      row = Math.floor(row);
      var indices = heap[0][row];
      var weights = heap[1][row];
      var isNew = heap[2][row];
      if (weight >= weights[0]) {
        return 0;
      }
      for (var i = 0; i < indices.length; i++) {
        if (index === indices[i]) {
          return 0;
        }
      }
      return uncheckedHeapPush(heap, row, weight, index, flag);
    }
    exports.heapPush = heapPush;
    function uncheckedHeapPush(heap, row, weight, index, flag) {
      var indices = heap[0][row];
      var weights = heap[1][row];
      var isNew = heap[2][row];
      if (weight >= weights[0]) {
        return 0;
      }
      weights[0] = weight;
      indices[0] = index;
      isNew[0] = flag;
      var i = 0;
      var iSwap = 0;
      while (true) {
        var ic1 = 2 * i + 1;
        var ic2 = ic1 + 1;
        var heapShape2 = heap[0][0].length;
        if (ic1 >= heapShape2) {
          break;
        } else if (ic2 >= heapShape2) {
          if (weights[ic1] > weight) {
            iSwap = ic1;
          } else {
            break;
          }
        } else if (weights[ic1] >= weights[ic2]) {
          if (weight < weights[ic1]) {
            iSwap = ic1;
          } else {
            break;
          }
        } else {
          if (weight < weights[ic2]) {
            iSwap = ic2;
          } else {
            break;
          }
        }
        weights[i] = weights[iSwap];
        indices[i] = indices[iSwap];
        isNew[i] = isNew[iSwap];
        i = iSwap;
      }
      weights[i] = weight;
      indices[i] = index;
      isNew[i] = flag;
      return 1;
    }
    exports.uncheckedHeapPush = uncheckedHeapPush;
    function buildCandidates(currentGraph, nVertices, nNeighbors, maxCandidates, random) {
      var candidateNeighbors = makeHeap(nVertices, maxCandidates);
      for (var i = 0; i < nVertices; i++) {
        for (var j = 0; j < nNeighbors; j++) {
          if (currentGraph[0][i][j] < 0) {
            continue;
          }
          var idx = currentGraph[0][i][j];
          var isn = currentGraph[2][i][j];
          var d = utils.tauRand(random);
          heapPush(candidateNeighbors, i, d, idx, isn);
          heapPush(candidateNeighbors, idx, d, i, isn);
          currentGraph[2][i][j] = 0;
        }
      }
      return candidateNeighbors;
    }
    exports.buildCandidates = buildCandidates;
    function deheapSort(heap) {
      var indices = heap[0];
      var weights = heap[1];
      for (var i = 0; i < indices.length; i++) {
        var indHeap = indices[i];
        var distHeap = weights[i];
        for (var j = 0; j < indHeap.length - 1; j++) {
          var indHeapIndex = indHeap.length - j - 1;
          var distHeapIndex = distHeap.length - j - 1;
          var temp1 = indHeap[0];
          indHeap[0] = indHeap[indHeapIndex];
          indHeap[indHeapIndex] = temp1;
          var temp2 = distHeap[0];
          distHeap[0] = distHeap[distHeapIndex];
          distHeap[distHeapIndex] = temp2;
          siftDown(distHeap, indHeap, distHeapIndex, 0);
        }
      }
      return { indices, weights };
    }
    exports.deheapSort = deheapSort;
    function siftDown(heap1, heap2, ceiling, elt) {
      while (elt * 2 + 1 < ceiling) {
        var leftChild = elt * 2 + 1;
        var rightChild = leftChild + 1;
        var swap = elt;
        if (heap1[swap] < heap1[leftChild]) {
          swap = leftChild;
        }
        if (rightChild < ceiling && heap1[swap] < heap1[rightChild]) {
          swap = rightChild;
        }
        if (swap === elt) {
          break;
        } else {
          var temp1 = heap1[elt];
          heap1[elt] = heap1[swap];
          heap1[swap] = temp1;
          var temp2 = heap2[elt];
          heap2[elt] = heap2[swap];
          heap2[swap] = temp2;
          elt = swap;
        }
      }
    }
    function smallestFlagged(heap, row) {
      var ind = heap[0][row];
      var dist = heap[1][row];
      var flag = heap[2][row];
      var minDist = Infinity;
      var resultIndex = -1;
      for (var i = 0; i > ind.length; i++) {
        if (flag[i] === 1 && dist[i] < minDist) {
          minDist = dist[i];
          resultIndex = i;
        }
      }
      if (resultIndex >= 0) {
        flag[resultIndex] = 0;
        return Math.floor(ind[resultIndex]);
      } else {
        return -1;
      }
    }
    exports.smallestFlagged = smallestFlagged;
  }
});

// node_modules/umap-js/dist/matrix.js
var require_matrix = __commonJS({
  "node_modules/umap-js/dist/matrix.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m)
        return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"]))
            m.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    var __values = exports && exports.__values || function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m)
        return m.call(o);
      if (o && typeof o.length === "number")
        return {
          next: function() {
            if (o && i >= o.length)
              o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCSR = exports.normalize = exports.eliminateZeros = exports.multiplyScalar = exports.maximum = exports.subtract = exports.add = exports.pairwiseMultiply = exports.identity = exports.transpose = exports.SparseMatrix = void 0;
    var utils = __importStar(require_utils());
    var SparseMatrix = function() {
      function SparseMatrix2(rows, cols, values, dims) {
        this.entries = /* @__PURE__ */ new Map();
        this.nRows = 0;
        this.nCols = 0;
        if (rows.length !== cols.length || rows.length !== values.length) {
          throw new Error("rows, cols and values arrays must all have the same length");
        }
        this.nRows = dims[0];
        this.nCols = dims[1];
        for (var i = 0; i < values.length; i++) {
          var row = rows[i];
          var col = cols[i];
          this.checkDims(row, col);
          var key = this.makeKey(row, col);
          this.entries.set(key, { value: values[i], row, col });
        }
      }
      SparseMatrix2.prototype.makeKey = function(row, col) {
        return row + ":" + col;
      };
      SparseMatrix2.prototype.checkDims = function(row, col) {
        var withinBounds = row < this.nRows && col < this.nCols;
        if (!withinBounds) {
          throw new Error("row and/or col specified outside of matrix dimensions");
        }
      };
      SparseMatrix2.prototype.set = function(row, col, value) {
        this.checkDims(row, col);
        var key = this.makeKey(row, col);
        if (!this.entries.has(key)) {
          this.entries.set(key, { value, row, col });
        } else {
          this.entries.get(key).value = value;
        }
      };
      SparseMatrix2.prototype.get = function(row, col, defaultValue) {
        if (defaultValue === void 0) {
          defaultValue = 0;
        }
        this.checkDims(row, col);
        var key = this.makeKey(row, col);
        if (this.entries.has(key)) {
          return this.entries.get(key).value;
        } else {
          return defaultValue;
        }
      };
      SparseMatrix2.prototype.getAll = function(ordered) {
        if (ordered === void 0) {
          ordered = true;
        }
        var rowColValues = [];
        this.entries.forEach(function(value) {
          rowColValues.push(value);
        });
        if (ordered) {
          rowColValues.sort(function(a, b) {
            if (a.row === b.row) {
              return a.col - b.col;
            } else {
              return a.row - b.row;
            }
          });
        }
        return rowColValues;
      };
      SparseMatrix2.prototype.getDims = function() {
        return [this.nRows, this.nCols];
      };
      SparseMatrix2.prototype.getRows = function() {
        return Array.from(this.entries, function(_a2) {
          var _b = __read(_a2, 2), key = _b[0], value = _b[1];
          return value.row;
        });
      };
      SparseMatrix2.prototype.getCols = function() {
        return Array.from(this.entries, function(_a2) {
          var _b = __read(_a2, 2), key = _b[0], value = _b[1];
          return value.col;
        });
      };
      SparseMatrix2.prototype.getValues = function() {
        return Array.from(this.entries, function(_a2) {
          var _b = __read(_a2, 2), key = _b[0], value = _b[1];
          return value.value;
        });
      };
      SparseMatrix2.prototype.forEach = function(fn) {
        this.entries.forEach(function(value) {
          return fn(value.value, value.row, value.col);
        });
      };
      SparseMatrix2.prototype.map = function(fn) {
        var vals = [];
        this.entries.forEach(function(value) {
          vals.push(fn(value.value, value.row, value.col));
        });
        var dims = [this.nRows, this.nCols];
        return new SparseMatrix2(this.getRows(), this.getCols(), vals, dims);
      };
      SparseMatrix2.prototype.toArray = function() {
        var _this = this;
        var rows = utils.empty(this.nRows);
        var output = rows.map(function() {
          return utils.zeros(_this.nCols);
        });
        this.entries.forEach(function(value) {
          output[value.row][value.col] = value.value;
        });
        return output;
      };
      return SparseMatrix2;
    }();
    exports.SparseMatrix = SparseMatrix;
    function transpose(matrix) {
      var cols = [];
      var rows = [];
      var vals = [];
      matrix.forEach(function(value, row, col) {
        cols.push(row);
        rows.push(col);
        vals.push(value);
      });
      var dims = [matrix.nCols, matrix.nRows];
      return new SparseMatrix(rows, cols, vals, dims);
    }
    exports.transpose = transpose;
    function identity(size) {
      var _a2 = __read(size, 1), rows = _a2[0];
      var matrix = new SparseMatrix([], [], [], size);
      for (var i = 0; i < rows; i++) {
        matrix.set(i, i, 1);
      }
      return matrix;
    }
    exports.identity = identity;
    function pairwiseMultiply(a, b) {
      return elementWise(a, b, function(x, y) {
        return x * y;
      });
    }
    exports.pairwiseMultiply = pairwiseMultiply;
    function add(a, b) {
      return elementWise(a, b, function(x, y) {
        return x + y;
      });
    }
    exports.add = add;
    function subtract(a, b) {
      return elementWise(a, b, function(x, y) {
        return x - y;
      });
    }
    exports.subtract = subtract;
    function maximum(a, b) {
      return elementWise(a, b, function(x, y) {
        return x > y ? x : y;
      });
    }
    exports.maximum = maximum;
    function multiplyScalar(a, scalar) {
      return a.map(function(value) {
        return value * scalar;
      });
    }
    exports.multiplyScalar = multiplyScalar;
    function eliminateZeros(m) {
      var zeroIndices = /* @__PURE__ */ new Set();
      var values = m.getValues();
      var rows = m.getRows();
      var cols = m.getCols();
      for (var i = 0; i < values.length; i++) {
        if (values[i] === 0) {
          zeroIndices.add(i);
        }
      }
      var removeByZeroIndex = function(_, index) {
        return !zeroIndices.has(index);
      };
      var nextValues = values.filter(removeByZeroIndex);
      var nextRows = rows.filter(removeByZeroIndex);
      var nextCols = cols.filter(removeByZeroIndex);
      return new SparseMatrix(nextRows, nextCols, nextValues, m.getDims());
    }
    exports.eliminateZeros = eliminateZeros;
    function normalize(m, normType) {
      var e_1, _a2;
      if (normType === void 0) {
        normType = "l2";
      }
      var normFn = normFns[normType];
      var colsByRow = /* @__PURE__ */ new Map();
      m.forEach(function(_, row2, col) {
        var cols = colsByRow.get(row2) || [];
        cols.push(col);
        colsByRow.set(row2, cols);
      });
      var nextMatrix = new SparseMatrix([], [], [], m.getDims());
      var _loop_1 = function(row2) {
        var cols = colsByRow.get(row2).sort();
        var vals = cols.map(function(col) {
          return m.get(row2, col);
        });
        var norm = normFn(vals);
        for (var i = 0; i < norm.length; i++) {
          nextMatrix.set(row2, cols[i], norm[i]);
        }
      };
      try {
        for (var _b = __values(colsByRow.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
          var row = _c.value;
          _loop_1(row);
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
      return nextMatrix;
    }
    exports.normalize = normalize;
    var normFns = (_a = {}, _a["max"] = function(xs) {
      var max = -Infinity;
      for (var i = 0; i < xs.length; i++) {
        max = xs[i] > max ? xs[i] : max;
      }
      return xs.map(function(x) {
        return x / max;
      });
    }, _a["l1"] = function(xs) {
      var sum = 0;
      for (var i = 0; i < xs.length; i++) {
        sum += xs[i];
      }
      return xs.map(function(x) {
        return x / sum;
      });
    }, _a["l2"] = function(xs) {
      var sum = 0;
      for (var i = 0; i < xs.length; i++) {
        sum += Math.pow(xs[i], 2);
      }
      return xs.map(function(x) {
        return Math.sqrt(Math.pow(x, 2) / sum);
      });
    }, _a);
    function elementWise(a, b, op) {
      var visited = /* @__PURE__ */ new Set();
      var rows = [];
      var cols = [];
      var vals = [];
      var operate = function(row2, col2) {
        rows.push(row2);
        cols.push(col2);
        var nextValue = op(a.get(row2, col2), b.get(row2, col2));
        vals.push(nextValue);
      };
      var valuesA = a.getValues();
      var rowsA = a.getRows();
      var colsA = a.getCols();
      for (var i = 0; i < valuesA.length; i++) {
        var row = rowsA[i];
        var col = colsA[i];
        var key = row + ":" + col;
        visited.add(key);
        operate(row, col);
      }
      var valuesB = b.getValues();
      var rowsB = b.getRows();
      var colsB = b.getCols();
      for (var i = 0; i < valuesB.length; i++) {
        var row = rowsB[i];
        var col = colsB[i];
        var key = row + ":" + col;
        if (visited.has(key))
          continue;
        operate(row, col);
      }
      var dims = [a.nRows, a.nCols];
      return new SparseMatrix(rows, cols, vals, dims);
    }
    function getCSR(x) {
      var entries = [];
      x.forEach(function(value2, row2, col2) {
        entries.push({ value: value2, row: row2, col: col2 });
      });
      entries.sort(function(a, b) {
        if (a.row === b.row) {
          return a.col - b.col;
        } else {
          return a.row - b.row;
        }
      });
      var indices = [];
      var values = [];
      var indptr = [];
      var currentRow = -1;
      for (var i = 0; i < entries.length; i++) {
        var _a2 = entries[i], row = _a2.row, col = _a2.col, value = _a2.value;
        if (row !== currentRow) {
          currentRow = row;
          indptr.push(i);
        }
        indices.push(col);
        values.push(value);
      }
      return { indices, values, indptr };
    }
    exports.getCSR = getCSR;
  }
});

// node_modules/umap-js/dist/tree.js
var require_tree = __commonJS({
  "node_modules/umap-js/dist/tree.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m)
        return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"]))
            m.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    var __spread = exports && exports.__spread || function() {
      for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
      return ar;
    };
    var __values = exports && exports.__values || function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m)
        return m.call(o);
      if (o && typeof o.length === "number")
        return {
          next: function() {
            if (o && i >= o.length)
              o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.searchFlatTree = exports.makeLeafArray = exports.makeForest = exports.FlatTree = void 0;
    var utils = __importStar(require_utils());
    var FlatTree = /* @__PURE__ */ function() {
      function FlatTree2(hyperplanes, offsets, children, indices) {
        this.hyperplanes = hyperplanes;
        this.offsets = offsets;
        this.children = children;
        this.indices = indices;
      }
      return FlatTree2;
    }();
    exports.FlatTree = FlatTree;
    function makeForest(data, nNeighbors, nTrees, random) {
      var leafSize = Math.max(10, nNeighbors);
      var trees = utils.range(nTrees).map(function(_, i) {
        return makeTree(data, leafSize, i, random);
      });
      var forest = trees.map(function(tree) {
        return flattenTree(tree, leafSize);
      });
      return forest;
    }
    exports.makeForest = makeForest;
    function makeTree(data, leafSize, n, random) {
      if (leafSize === void 0) {
        leafSize = 30;
      }
      var indices = utils.range(data.length);
      var tree = makeEuclideanTree(data, indices, leafSize, n, random);
      return tree;
    }
    function makeEuclideanTree(data, indices, leafSize, q, random) {
      if (leafSize === void 0) {
        leafSize = 30;
      }
      if (indices.length > leafSize) {
        var splitResults = euclideanRandomProjectionSplit(data, indices, random);
        var indicesLeft = splitResults.indicesLeft, indicesRight = splitResults.indicesRight, hyperplane = splitResults.hyperplane, offset = splitResults.offset;
        var leftChild = makeEuclideanTree(data, indicesLeft, leafSize, q + 1, random);
        var rightChild = makeEuclideanTree(data, indicesRight, leafSize, q + 1, random);
        var node = { leftChild, rightChild, isLeaf: false, hyperplane, offset };
        return node;
      } else {
        var node = { indices, isLeaf: true };
        return node;
      }
    }
    function euclideanRandomProjectionSplit(data, indices, random) {
      var dim = data[0].length;
      var leftIndex = utils.tauRandInt(indices.length, random);
      var rightIndex = utils.tauRandInt(indices.length, random);
      rightIndex += leftIndex === rightIndex ? 1 : 0;
      rightIndex = rightIndex % indices.length;
      var left = indices[leftIndex];
      var right = indices[rightIndex];
      var hyperplaneOffset = 0;
      var hyperplaneVector = utils.zeros(dim);
      for (var i = 0; i < hyperplaneVector.length; i++) {
        hyperplaneVector[i] = data[left][i] - data[right][i];
        hyperplaneOffset -= hyperplaneVector[i] * (data[left][i] + data[right][i]) / 2;
      }
      var nLeft = 0;
      var nRight = 0;
      var side = utils.zeros(indices.length);
      for (var i = 0; i < indices.length; i++) {
        var margin = hyperplaneOffset;
        for (var d = 0; d < dim; d++) {
          margin += hyperplaneVector[d] * data[indices[i]][d];
        }
        if (margin === 0) {
          side[i] = utils.tauRandInt(2, random);
          if (side[i] === 0) {
            nLeft += 1;
          } else {
            nRight += 1;
          }
        } else if (margin > 0) {
          side[i] = 0;
          nLeft += 1;
        } else {
          side[i] = 1;
          nRight += 1;
        }
      }
      var indicesLeft = utils.zeros(nLeft);
      var indicesRight = utils.zeros(nRight);
      nLeft = 0;
      nRight = 0;
      for (var i = 0; i < side.length; i++) {
        if (side[i] === 0) {
          indicesLeft[nLeft] = indices[i];
          nLeft += 1;
        } else {
          indicesRight[nRight] = indices[i];
          nRight += 1;
        }
      }
      return {
        indicesLeft,
        indicesRight,
        hyperplane: hyperplaneVector,
        offset: hyperplaneOffset
      };
    }
    function flattenTree(tree, leafSize) {
      var nNodes = numNodes(tree);
      var nLeaves = numLeaves(tree);
      var hyperplanes = utils.range(nNodes).map(function() {
        return utils.zeros(tree.hyperplane ? tree.hyperplane.length : 0);
      });
      var offsets = utils.zeros(nNodes);
      var children = utils.range(nNodes).map(function() {
        return [-1, -1];
      });
      var indices = utils.range(nLeaves).map(function() {
        return utils.range(leafSize).map(function() {
          return -1;
        });
      });
      recursiveFlatten(tree, hyperplanes, offsets, children, indices, 0, 0);
      return new FlatTree(hyperplanes, offsets, children, indices);
    }
    function recursiveFlatten(tree, hyperplanes, offsets, children, indices, nodeNum, leafNum) {
      var _a;
      if (tree.isLeaf) {
        children[nodeNum][0] = -leafNum;
        (_a = indices[leafNum]).splice.apply(_a, __spread([0, tree.indices.length], tree.indices));
        leafNum += 1;
        return { nodeNum, leafNum };
      } else {
        hyperplanes[nodeNum] = tree.hyperplane;
        offsets[nodeNum] = tree.offset;
        children[nodeNum][0] = nodeNum + 1;
        var oldNodeNum = nodeNum;
        var res = recursiveFlatten(tree.leftChild, hyperplanes, offsets, children, indices, nodeNum + 1, leafNum);
        nodeNum = res.nodeNum;
        leafNum = res.leafNum;
        children[oldNodeNum][1] = nodeNum + 1;
        res = recursiveFlatten(tree.rightChild, hyperplanes, offsets, children, indices, nodeNum + 1, leafNum);
        return { nodeNum: res.nodeNum, leafNum: res.leafNum };
      }
    }
    function numNodes(tree) {
      if (tree.isLeaf) {
        return 1;
      } else {
        return 1 + numNodes(tree.leftChild) + numNodes(tree.rightChild);
      }
    }
    function numLeaves(tree) {
      if (tree.isLeaf) {
        return 1;
      } else {
        return numLeaves(tree.leftChild) + numLeaves(tree.rightChild);
      }
    }
    function makeLeafArray(rpForest) {
      var e_1, _a;
      if (rpForest.length > 0) {
        var output = [];
        try {
          for (var rpForest_1 = __values(rpForest), rpForest_1_1 = rpForest_1.next(); !rpForest_1_1.done; rpForest_1_1 = rpForest_1.next()) {
            var tree = rpForest_1_1.value;
            output.push.apply(output, __spread(tree.indices));
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (rpForest_1_1 && !rpForest_1_1.done && (_a = rpForest_1.return))
              _a.call(rpForest_1);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
        return output;
      } else {
        return [[-1]];
      }
    }
    exports.makeLeafArray = makeLeafArray;
    function selectSide(hyperplane, offset, point, random) {
      var margin = offset;
      for (var d = 0; d < point.length; d++) {
        margin += hyperplane[d] * point[d];
      }
      if (margin === 0) {
        var side = utils.tauRandInt(2, random);
        return side;
      } else if (margin > 0) {
        return 0;
      } else {
        return 1;
      }
    }
    function searchFlatTree(point, tree, random) {
      var node = 0;
      while (tree.children[node][0] > 0) {
        var side = selectSide(tree.hyperplanes[node], tree.offsets[node], point, random);
        if (side === 0) {
          node = tree.children[node][0];
        } else {
          node = tree.children[node][1];
        }
      }
      var index = -1 * tree.children[node][0];
      return tree.indices[index];
    }
    exports.searchFlatTree = searchFlatTree;
  }
});

// node_modules/umap-js/dist/nn_descent.js
var require_nn_descent = __commonJS({
  "node_modules/umap-js/dist/nn_descent.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __values = exports && exports.__values || function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m)
        return m.call(o);
      if (o && typeof o.length === "number")
        return {
          next: function() {
            if (o && i >= o.length)
              o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initializeSearch = exports.makeInitializedNNSearch = exports.makeInitializations = exports.makeNNDescent = void 0;
    var heap = __importStar(require_heap());
    var matrix = __importStar(require_matrix());
    var tree = __importStar(require_tree());
    var utils = __importStar(require_utils());
    function makeNNDescent(distanceFn, random) {
      return function nNDescent(data, leafArray, nNeighbors, nIters, maxCandidates, delta, rho, rpTreeInit) {
        if (nIters === void 0) {
          nIters = 10;
        }
        if (maxCandidates === void 0) {
          maxCandidates = 50;
        }
        if (delta === void 0) {
          delta = 1e-3;
        }
        if (rho === void 0) {
          rho = 0.5;
        }
        if (rpTreeInit === void 0) {
          rpTreeInit = true;
        }
        var nVertices = data.length;
        var currentGraph = heap.makeHeap(data.length, nNeighbors);
        for (var i = 0; i < data.length; i++) {
          var indices = heap.rejectionSample(nNeighbors, data.length, random);
          for (var j = 0; j < indices.length; j++) {
            var d = distanceFn(data[i], data[indices[j]]);
            heap.heapPush(currentGraph, i, d, indices[j], 1);
            heap.heapPush(currentGraph, indices[j], d, i, 1);
          }
        }
        if (rpTreeInit) {
          for (var n = 0; n < leafArray.length; n++) {
            for (var i = 0; i < leafArray[n].length; i++) {
              if (leafArray[n][i] < 0) {
                break;
              }
              for (var j = i + 1; j < leafArray[n].length; j++) {
                if (leafArray[n][j] < 0) {
                  break;
                }
                var d = distanceFn(data[leafArray[n][i]], data[leafArray[n][j]]);
                heap.heapPush(currentGraph, leafArray[n][i], d, leafArray[n][j], 1);
                heap.heapPush(currentGraph, leafArray[n][j], d, leafArray[n][i], 1);
              }
            }
          }
        }
        for (var n = 0; n < nIters; n++) {
          var candidateNeighbors = heap.buildCandidates(currentGraph, nVertices, nNeighbors, maxCandidates, random);
          var c = 0;
          for (var i = 0; i < nVertices; i++) {
            for (var j = 0; j < maxCandidates; j++) {
              var p = Math.floor(candidateNeighbors[0][i][j]);
              if (p < 0 || utils.tauRand(random) < rho) {
                continue;
              }
              for (var k = 0; k < maxCandidates; k++) {
                var q = Math.floor(candidateNeighbors[0][i][k]);
                var cj = candidateNeighbors[2][i][j];
                var ck = candidateNeighbors[2][i][k];
                if (q < 0 || !cj && !ck) {
                  continue;
                }
                var d = distanceFn(data[p], data[q]);
                c += heap.heapPush(currentGraph, p, d, q, 1);
                c += heap.heapPush(currentGraph, q, d, p, 1);
              }
            }
          }
          if (c <= delta * nNeighbors * data.length) {
            break;
          }
        }
        var sorted = heap.deheapSort(currentGraph);
        return sorted;
      };
    }
    exports.makeNNDescent = makeNNDescent;
    function makeInitializations(distanceFn) {
      function initFromRandom(nNeighbors, data, queryPoints, _heap, random) {
        for (var i = 0; i < queryPoints.length; i++) {
          var indices = utils.rejectionSample(nNeighbors, data.length, random);
          for (var j = 0; j < indices.length; j++) {
            if (indices[j] < 0) {
              continue;
            }
            var d = distanceFn(data[indices[j]], queryPoints[i]);
            heap.heapPush(_heap, i, d, indices[j], 1);
          }
        }
      }
      function initFromTree(_tree, data, queryPoints, _heap, random) {
        for (var i = 0; i < queryPoints.length; i++) {
          var indices = tree.searchFlatTree(queryPoints[i], _tree, random);
          for (var j = 0; j < indices.length; j++) {
            if (indices[j] < 0) {
              return;
            }
            var d = distanceFn(data[indices[j]], queryPoints[i]);
            heap.heapPush(_heap, i, d, indices[j], 1);
          }
        }
        return;
      }
      return { initFromRandom, initFromTree };
    }
    exports.makeInitializations = makeInitializations;
    function makeInitializedNNSearch(distanceFn) {
      return function nnSearchFn(data, graph, initialization, queryPoints) {
        var e_1, _a;
        var _b = matrix.getCSR(graph), indices = _b.indices, indptr = _b.indptr;
        for (var i = 0; i < queryPoints.length; i++) {
          var tried = new Set(initialization[0][i]);
          while (true) {
            var vertex = heap.smallestFlagged(initialization, i);
            if (vertex === -1) {
              break;
            }
            var candidates = indices.slice(indptr[vertex], indptr[vertex + 1]);
            try {
              for (var candidates_1 = (e_1 = void 0, __values(candidates)), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                var candidate = candidates_1_1.value;
                if (candidate === vertex || candidate === -1 || tried.has(candidate)) {
                  continue;
                }
                var d = distanceFn(data[candidate], queryPoints[i]);
                heap.uncheckedHeapPush(initialization, i, d, candidate, 1);
                tried.add(candidate);
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (candidates_1_1 && !candidates_1_1.done && (_a = candidates_1.return))
                  _a.call(candidates_1);
              } finally {
                if (e_1)
                  throw e_1.error;
              }
            }
          }
        }
        return initialization;
      };
    }
    exports.makeInitializedNNSearch = makeInitializedNNSearch;
    function initializeSearch(forest, data, queryPoints, nNeighbors, initFromRandom, initFromTree, random) {
      var e_2, _a;
      var results = heap.makeHeap(queryPoints.length, nNeighbors);
      initFromRandom(nNeighbors, data, queryPoints, results, random);
      if (forest) {
        try {
          for (var forest_1 = __values(forest), forest_1_1 = forest_1.next(); !forest_1_1.done; forest_1_1 = forest_1.next()) {
            var tree_1 = forest_1_1.value;
            initFromTree(tree_1, data, queryPoints, results, random);
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (forest_1_1 && !forest_1_1.done && (_a = forest_1.return))
              _a.call(forest_1);
          } finally {
            if (e_2)
              throw e_2.error;
          }
        }
      }
      return results;
    }
    exports.initializeSearch = initializeSearch;
  }
});

// node_modules/is-any-array/lib/index.js
var require_lib = __commonJS({
  "node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var toString = Object.prototype.toString;
    function isAnyArray(object) {
      return toString.call(object).endsWith("Array]");
    }
    exports.default = isAnyArray;
  }
});

// node_modules/ml-matrix/node_modules/is-any-array/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/ml-matrix/node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAnyArray = void 0;
    var toString = Object.prototype.toString;
    function isAnyArray(value) {
      const tag = toString.call(value);
      return tag.endsWith("Array]") && !tag.includes("Big");
    }
    exports.isAnyArray = isAnyArray;
  }
});

// node_modules/ml-array-rescale/node_modules/is-any-array/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/ml-array-rescale/node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAnyArray = void 0;
    var toString = Object.prototype.toString;
    function isAnyArray(value) {
      const tag = toString.call(value);
      return tag.endsWith("Array]") && !tag.includes("Big");
    }
    exports.isAnyArray = isAnyArray;
  }
});

// node_modules/ml-array-max/node_modules/is-any-array/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/ml-array-max/node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAnyArray = void 0;
    var toString = Object.prototype.toString;
    function isAnyArray(value) {
      const tag = toString.call(value);
      return tag.endsWith("Array]") && !tag.includes("Big");
    }
    exports.isAnyArray = isAnyArray;
  }
});

// node_modules/ml-array-max/lib/index.js
var require_lib5 = __commonJS({
  "node_modules/ml-array-max/lib/index.js"(exports, module2) {
    "use strict";
    var isAnyArray = require_lib4();
    function max(input, options = {}) {
      if (!isAnyArray.isAnyArray(input)) {
        throw new TypeError("input must be an array");
      }
      if (input.length === 0) {
        throw new TypeError("input must not be empty");
      }
      const { fromIndex = 0, toIndex = input.length } = options;
      if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
        throw new Error("fromIndex must be a positive integer smaller than length");
      }
      if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
        throw new Error(
          "toIndex must be an integer greater than fromIndex and at most equal to length"
        );
      }
      let maxValue = input[fromIndex];
      for (let i = fromIndex + 1; i < toIndex; i++) {
        if (input[i] > maxValue)
          maxValue = input[i];
      }
      return maxValue;
    }
    module2.exports = max;
  }
});

// node_modules/ml-array-min/node_modules/is-any-array/lib/index.js
var require_lib6 = __commonJS({
  "node_modules/ml-array-min/node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAnyArray = void 0;
    var toString = Object.prototype.toString;
    function isAnyArray(value) {
      const tag = toString.call(value);
      return tag.endsWith("Array]") && !tag.includes("Big");
    }
    exports.isAnyArray = isAnyArray;
  }
});

// node_modules/ml-array-min/lib/index.js
var require_lib7 = __commonJS({
  "node_modules/ml-array-min/lib/index.js"(exports, module2) {
    "use strict";
    var isAnyArray = require_lib6();
    function min(input, options = {}) {
      if (!isAnyArray.isAnyArray(input)) {
        throw new TypeError("input must be an array");
      }
      if (input.length === 0) {
        throw new TypeError("input must not be empty");
      }
      const { fromIndex = 0, toIndex = input.length } = options;
      if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
        throw new Error("fromIndex must be a positive integer smaller than length");
      }
      if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
        throw new Error(
          "toIndex must be an integer greater than fromIndex and at most equal to length"
        );
      }
      let minValue = input[fromIndex];
      for (let i = fromIndex + 1; i < toIndex; i++) {
        if (input[i] < minValue)
          minValue = input[i];
      }
      return minValue;
    }
    module2.exports = min;
  }
});

// node_modules/ml-array-rescale/lib/index.js
var require_lib8 = __commonJS({
  "node_modules/ml-array-rescale/lib/index.js"(exports, module2) {
    "use strict";
    var isAnyArray = require_lib3();
    var max = require_lib5();
    var min = require_lib7();
    function _interopDefaultLegacy(e) {
      return e && typeof e === "object" && "default" in e ? e : { "default": e };
    }
    var max__default = /* @__PURE__ */ _interopDefaultLegacy(max);
    var min__default = /* @__PURE__ */ _interopDefaultLegacy(min);
    function rescale(input, options = {}) {
      if (!isAnyArray.isAnyArray(input)) {
        throw new TypeError("input must be an array");
      } else if (input.length === 0) {
        throw new TypeError("input must not be empty");
      }
      let output;
      if (options.output !== void 0) {
        if (!isAnyArray.isAnyArray(options.output)) {
          throw new TypeError("output option must be an array if specified");
        }
        output = options.output;
      } else {
        output = new Array(input.length);
      }
      const currentMin = min__default["default"](input);
      const currentMax = max__default["default"](input);
      if (currentMin === currentMax) {
        throw new RangeError(
          "minimum and maximum input values are equal. Cannot rescale a constant array"
        );
      }
      const {
        min: minValue = options.autoMinMax ? currentMin : 0,
        max: maxValue = options.autoMinMax ? currentMax : 1
      } = options;
      if (minValue >= maxValue) {
        throw new RangeError("min option must be smaller than max option");
      }
      const factor = (maxValue - minValue) / (currentMax - currentMin);
      for (let i = 0; i < input.length; i++) {
        output[i] = (input[i] - currentMin) * factor + minValue;
      }
      return output;
    }
    module2.exports = rescale;
  }
});

// node_modules/ml-matrix/matrix.js
var require_matrix2 = __commonJS({
  "node_modules/ml-matrix/matrix.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var isAnyArray = require_lib2();
    var rescale = require_lib8();
    var indent = " ".repeat(2);
    var indentData = " ".repeat(4);
    function inspectMatrix() {
      return inspectMatrixWithOptions(this);
    }
    function inspectMatrixWithOptions(matrix, options = {}) {
      const {
        maxRows = 15,
        maxColumns = 10,
        maxNumSize = 8,
        padMinus = "auto"
      } = options;
      return `${matrix.constructor.name} {
${indent}[
${indentData}${inspectData(matrix, maxRows, maxColumns, maxNumSize, padMinus)}
${indent}]
${indent}rows: ${matrix.rows}
${indent}columns: ${matrix.columns}
}`;
    }
    function inspectData(matrix, maxRows, maxColumns, maxNumSize, padMinus) {
      const { rows, columns } = matrix;
      const maxI = Math.min(rows, maxRows);
      const maxJ = Math.min(columns, maxColumns);
      const result = [];
      if (padMinus === "auto") {
        padMinus = false;
        loop:
          for (let i = 0; i < maxI; i++) {
            for (let j = 0; j < maxJ; j++) {
              if (matrix.get(i, j) < 0) {
                padMinus = true;
                break loop;
              }
            }
          }
      }
      for (let i = 0; i < maxI; i++) {
        let line = [];
        for (let j = 0; j < maxJ; j++) {
          line.push(formatNumber(matrix.get(i, j), maxNumSize, padMinus));
        }
        result.push(`${line.join(" ")}`);
      }
      if (maxJ !== columns) {
        result[result.length - 1] += ` ... ${columns - maxColumns} more columns`;
      }
      if (maxI !== rows) {
        result.push(`... ${rows - maxRows} more rows`);
      }
      return result.join(`
${indentData}`);
    }
    function formatNumber(num, maxNumSize, padMinus) {
      return (num >= 0 && padMinus ? ` ${formatNumber2(num, maxNumSize - 1)}` : formatNumber2(num, maxNumSize)).padEnd(maxNumSize);
    }
    function formatNumber2(num, len) {
      let str = num.toString();
      if (str.length <= len)
        return str;
      let fix = num.toFixed(len);
      if (fix.length > len) {
        fix = num.toFixed(Math.max(0, len - (fix.length - len)));
      }
      if (fix.length <= len && !fix.startsWith("0.000") && !fix.startsWith("-0.000")) {
        return fix;
      }
      let exp = num.toExponential(len);
      if (exp.length > len) {
        exp = num.toExponential(Math.max(0, len - (exp.length - len)));
      }
      return exp.slice(0);
    }
    function installMathOperations(AbstractMatrix2, Matrix2) {
      AbstractMatrix2.prototype.add = function add(value) {
        if (typeof value === "number")
          return this.addS(value);
        return this.addM(value);
      };
      AbstractMatrix2.prototype.addS = function addS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.addM = function addM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.add = function add(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.add(value);
      };
      AbstractMatrix2.prototype.sub = function sub(value) {
        if (typeof value === "number")
          return this.subS(value);
        return this.subM(value);
      };
      AbstractMatrix2.prototype.subS = function subS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.subM = function subM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.sub = function sub(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sub(value);
      };
      AbstractMatrix2.prototype.subtract = AbstractMatrix2.prototype.sub;
      AbstractMatrix2.prototype.subtractS = AbstractMatrix2.prototype.subS;
      AbstractMatrix2.prototype.subtractM = AbstractMatrix2.prototype.subM;
      AbstractMatrix2.subtract = AbstractMatrix2.sub;
      AbstractMatrix2.prototype.mul = function mul(value) {
        if (typeof value === "number")
          return this.mulS(value);
        return this.mulM(value);
      };
      AbstractMatrix2.prototype.mulS = function mulS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.mulM = function mulM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.mul = function mul(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.mul(value);
      };
      AbstractMatrix2.prototype.multiply = AbstractMatrix2.prototype.mul;
      AbstractMatrix2.prototype.multiplyS = AbstractMatrix2.prototype.mulS;
      AbstractMatrix2.prototype.multiplyM = AbstractMatrix2.prototype.mulM;
      AbstractMatrix2.multiply = AbstractMatrix2.mul;
      AbstractMatrix2.prototype.div = function div(value) {
        if (typeof value === "number")
          return this.divS(value);
        return this.divM(value);
      };
      AbstractMatrix2.prototype.divS = function divS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.divM = function divM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.div = function div(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.div(value);
      };
      AbstractMatrix2.prototype.divide = AbstractMatrix2.prototype.div;
      AbstractMatrix2.prototype.divideS = AbstractMatrix2.prototype.divS;
      AbstractMatrix2.prototype.divideM = AbstractMatrix2.prototype.divM;
      AbstractMatrix2.divide = AbstractMatrix2.div;
      AbstractMatrix2.prototype.mod = function mod(value) {
        if (typeof value === "number")
          return this.modS(value);
        return this.modM(value);
      };
      AbstractMatrix2.prototype.modS = function modS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) % value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.modM = function modM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) % matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.mod = function mod(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.mod(value);
      };
      AbstractMatrix2.prototype.modulus = AbstractMatrix2.prototype.mod;
      AbstractMatrix2.prototype.modulusS = AbstractMatrix2.prototype.modS;
      AbstractMatrix2.prototype.modulusM = AbstractMatrix2.prototype.modM;
      AbstractMatrix2.modulus = AbstractMatrix2.mod;
      AbstractMatrix2.prototype.and = function and(value) {
        if (typeof value === "number")
          return this.andS(value);
        return this.andM(value);
      };
      AbstractMatrix2.prototype.andS = function andS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) & value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.andM = function andM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) & matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.and = function and(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.and(value);
      };
      AbstractMatrix2.prototype.or = function or(value) {
        if (typeof value === "number")
          return this.orS(value);
        return this.orM(value);
      };
      AbstractMatrix2.prototype.orS = function orS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) | value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.orM = function orM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) | matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.or = function or(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.or(value);
      };
      AbstractMatrix2.prototype.xor = function xor(value) {
        if (typeof value === "number")
          return this.xorS(value);
        return this.xorM(value);
      };
      AbstractMatrix2.prototype.xorS = function xorS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) ^ value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.xorM = function xorM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) ^ matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.xor = function xor(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.xor(value);
      };
      AbstractMatrix2.prototype.leftShift = function leftShift(value) {
        if (typeof value === "number")
          return this.leftShiftS(value);
        return this.leftShiftM(value);
      };
      AbstractMatrix2.prototype.leftShiftS = function leftShiftS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) << value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.leftShiftM = function leftShiftM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) << matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.leftShift = function leftShift(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.leftShift(value);
      };
      AbstractMatrix2.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
        if (typeof value === "number")
          return this.signPropagatingRightShiftS(value);
        return this.signPropagatingRightShiftM(value);
      };
      AbstractMatrix2.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) >> value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.signPropagatingRightShiftM = function signPropagatingRightShiftM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) >> matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.signPropagatingRightShift = function signPropagatingRightShift(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.signPropagatingRightShift(value);
      };
      AbstractMatrix2.prototype.rightShift = function rightShift(value) {
        if (typeof value === "number")
          return this.rightShiftS(value);
        return this.rightShiftM(value);
      };
      AbstractMatrix2.prototype.rightShiftS = function rightShiftS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) >>> value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.rightShiftM = function rightShiftM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) >>> matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.rightShift = function rightShift(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.rightShift(value);
      };
      AbstractMatrix2.prototype.zeroFillRightShift = AbstractMatrix2.prototype.rightShift;
      AbstractMatrix2.prototype.zeroFillRightShiftS = AbstractMatrix2.prototype.rightShiftS;
      AbstractMatrix2.prototype.zeroFillRightShiftM = AbstractMatrix2.prototype.rightShiftM;
      AbstractMatrix2.zeroFillRightShift = AbstractMatrix2.rightShift;
      AbstractMatrix2.prototype.not = function not() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, ~this.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.not = function not(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.not();
      };
      AbstractMatrix2.prototype.abs = function abs() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.abs(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.abs = function abs(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.abs();
      };
      AbstractMatrix2.prototype.acos = function acos() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.acos(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.acos = function acos(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.acos();
      };
      AbstractMatrix2.prototype.acosh = function acosh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.acosh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.acosh = function acosh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.acosh();
      };
      AbstractMatrix2.prototype.asin = function asin() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.asin(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.asin = function asin(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.asin();
      };
      AbstractMatrix2.prototype.asinh = function asinh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.asinh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.asinh = function asinh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.asinh();
      };
      AbstractMatrix2.prototype.atan = function atan() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.atan(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.atan = function atan(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.atan();
      };
      AbstractMatrix2.prototype.atanh = function atanh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.atanh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.atanh = function atanh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.atanh();
      };
      AbstractMatrix2.prototype.cbrt = function cbrt() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.cbrt(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.cbrt = function cbrt(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.cbrt();
      };
      AbstractMatrix2.prototype.ceil = function ceil() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.ceil(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.ceil = function ceil(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.ceil();
      };
      AbstractMatrix2.prototype.clz32 = function clz32() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.clz32(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.clz32 = function clz32(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.clz32();
      };
      AbstractMatrix2.prototype.cos = function cos() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.cos(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.cos = function cos(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.cos();
      };
      AbstractMatrix2.prototype.cosh = function cosh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.cosh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.cosh = function cosh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.cosh();
      };
      AbstractMatrix2.prototype.exp = function exp() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.exp(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.exp = function exp(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.exp();
      };
      AbstractMatrix2.prototype.expm1 = function expm1() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.expm1(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.expm1 = function expm1(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.expm1();
      };
      AbstractMatrix2.prototype.floor = function floor() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.floor(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.floor = function floor(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.floor();
      };
      AbstractMatrix2.prototype.fround = function fround() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.fround(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.fround = function fround(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.fround();
      };
      AbstractMatrix2.prototype.log = function log() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.log(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.log = function log(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log();
      };
      AbstractMatrix2.prototype.log1p = function log1p() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.log1p(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.log1p = function log1p(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log1p();
      };
      AbstractMatrix2.prototype.log10 = function log10() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.log10(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.log10 = function log10(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log10();
      };
      AbstractMatrix2.prototype.log2 = function log2() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.log2(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.log2 = function log2(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log2();
      };
      AbstractMatrix2.prototype.round = function round() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.round(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.round = function round(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.round();
      };
      AbstractMatrix2.prototype.sign = function sign() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.sign(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.sign = function sign(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sign();
      };
      AbstractMatrix2.prototype.sin = function sin() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.sin(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.sin = function sin(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sin();
      };
      AbstractMatrix2.prototype.sinh = function sinh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.sinh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.sinh = function sinh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sinh();
      };
      AbstractMatrix2.prototype.sqrt = function sqrt() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.sqrt(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.sqrt = function sqrt(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sqrt();
      };
      AbstractMatrix2.prototype.tan = function tan() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.tan(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.tan = function tan(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.tan();
      };
      AbstractMatrix2.prototype.tanh = function tanh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.tanh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.tanh = function tanh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.tanh();
      };
      AbstractMatrix2.prototype.trunc = function trunc() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.trunc(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.trunc = function trunc(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.trunc();
      };
      AbstractMatrix2.pow = function pow(matrix, arg0) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.pow(arg0);
      };
      AbstractMatrix2.prototype.pow = function pow(value) {
        if (typeof value === "number")
          return this.powS(value);
        return this.powM(value);
      };
      AbstractMatrix2.prototype.powS = function powS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) ** value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.powM = function powM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) ** matrix.get(i, j));
          }
        }
        return this;
      };
    }
    function checkRowIndex(matrix, index, outer) {
      let max = outer ? matrix.rows : matrix.rows - 1;
      if (index < 0 || index > max) {
        throw new RangeError("Row index out of range");
      }
    }
    function checkColumnIndex(matrix, index, outer) {
      let max = outer ? matrix.columns : matrix.columns - 1;
      if (index < 0 || index > max) {
        throw new RangeError("Column index out of range");
      }
    }
    function checkRowVector(matrix, vector) {
      if (vector.to1DArray) {
        vector = vector.to1DArray();
      }
      if (vector.length !== matrix.columns) {
        throw new RangeError(
          "vector size must be the same as the number of columns"
        );
      }
      return vector;
    }
    function checkColumnVector(matrix, vector) {
      if (vector.to1DArray) {
        vector = vector.to1DArray();
      }
      if (vector.length !== matrix.rows) {
        throw new RangeError("vector size must be the same as the number of rows");
      }
      return vector;
    }
    function checkRowIndices(matrix, rowIndices) {
      if (!isAnyArray.isAnyArray(rowIndices)) {
        throw new TypeError("row indices must be an array");
      }
      for (let i = 0; i < rowIndices.length; i++) {
        if (rowIndices[i] < 0 || rowIndices[i] >= matrix.rows) {
          throw new RangeError("row indices are out of range");
        }
      }
    }
    function checkColumnIndices(matrix, columnIndices) {
      if (!isAnyArray.isAnyArray(columnIndices)) {
        throw new TypeError("column indices must be an array");
      }
      for (let i = 0; i < columnIndices.length; i++) {
        if (columnIndices[i] < 0 || columnIndices[i] >= matrix.columns) {
          throw new RangeError("column indices are out of range");
        }
      }
    }
    function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
      if (arguments.length !== 5) {
        throw new RangeError("expected 4 arguments");
      }
      checkNumber("startRow", startRow);
      checkNumber("endRow", endRow);
      checkNumber("startColumn", startColumn);
      checkNumber("endColumn", endColumn);
      if (startRow > endRow || startColumn > endColumn || startRow < 0 || startRow >= matrix.rows || endRow < 0 || endRow >= matrix.rows || startColumn < 0 || startColumn >= matrix.columns || endColumn < 0 || endColumn >= matrix.columns) {
        throw new RangeError("Submatrix indices are out of range");
      }
    }
    function newArray(length, value = 0) {
      let array = [];
      for (let i = 0; i < length; i++) {
        array.push(value);
      }
      return array;
    }
    function checkNumber(name, value) {
      if (typeof value !== "number") {
        throw new TypeError(`${name} must be a number`);
      }
    }
    function checkNonEmpty(matrix) {
      if (matrix.isEmpty()) {
        throw new Error("Empty matrix has no elements to index");
      }
    }
    function sumByRow(matrix) {
      let sum = newArray(matrix.rows);
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
          sum[i] += matrix.get(i, j);
        }
      }
      return sum;
    }
    function sumByColumn(matrix) {
      let sum = newArray(matrix.columns);
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
          sum[j] += matrix.get(i, j);
        }
      }
      return sum;
    }
    function sumAll(matrix) {
      let v = 0;
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          v += matrix.get(i, j);
        }
      }
      return v;
    }
    function productByRow(matrix) {
      let sum = newArray(matrix.rows, 1);
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
          sum[i] *= matrix.get(i, j);
        }
      }
      return sum;
    }
    function productByColumn(matrix) {
      let sum = newArray(matrix.columns, 1);
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
          sum[j] *= matrix.get(i, j);
        }
      }
      return sum;
    }
    function productAll(matrix) {
      let v = 1;
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          v *= matrix.get(i, j);
        }
      }
      return v;
    }
    function varianceByRow(matrix, unbiased, mean) {
      const rows = matrix.rows;
      const cols = matrix.columns;
      const variance = [];
      for (let i = 0; i < rows; i++) {
        let sum1 = 0;
        let sum2 = 0;
        let x = 0;
        for (let j = 0; j < cols; j++) {
          x = matrix.get(i, j) - mean[i];
          sum1 += x;
          sum2 += x * x;
        }
        if (unbiased) {
          variance.push((sum2 - sum1 * sum1 / cols) / (cols - 1));
        } else {
          variance.push((sum2 - sum1 * sum1 / cols) / cols);
        }
      }
      return variance;
    }
    function varianceByColumn(matrix, unbiased, mean) {
      const rows = matrix.rows;
      const cols = matrix.columns;
      const variance = [];
      for (let j = 0; j < cols; j++) {
        let sum1 = 0;
        let sum2 = 0;
        let x = 0;
        for (let i = 0; i < rows; i++) {
          x = matrix.get(i, j) - mean[j];
          sum1 += x;
          sum2 += x * x;
        }
        if (unbiased) {
          variance.push((sum2 - sum1 * sum1 / rows) / (rows - 1));
        } else {
          variance.push((sum2 - sum1 * sum1 / rows) / rows);
        }
      }
      return variance;
    }
    function varianceAll(matrix, unbiased, mean) {
      const rows = matrix.rows;
      const cols = matrix.columns;
      const size = rows * cols;
      let sum1 = 0;
      let sum2 = 0;
      let x = 0;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          x = matrix.get(i, j) - mean;
          sum1 += x;
          sum2 += x * x;
        }
      }
      if (unbiased) {
        return (sum2 - sum1 * sum1 / size) / (size - 1);
      } else {
        return (sum2 - sum1 * sum1 / size) / size;
      }
    }
    function centerByRow(matrix, mean) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) - mean[i]);
        }
      }
    }
    function centerByColumn(matrix, mean) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) - mean[j]);
        }
      }
    }
    function centerAll(matrix, mean) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) - mean);
        }
      }
    }
    function getScaleByRow(matrix) {
      const scale = [];
      for (let i = 0; i < matrix.rows; i++) {
        let sum = 0;
        for (let j = 0; j < matrix.columns; j++) {
          sum += matrix.get(i, j) ** 2 / (matrix.columns - 1);
        }
        scale.push(Math.sqrt(sum));
      }
      return scale;
    }
    function scaleByRow(matrix, scale) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) / scale[i]);
        }
      }
    }
    function getScaleByColumn(matrix) {
      const scale = [];
      for (let j = 0; j < matrix.columns; j++) {
        let sum = 0;
        for (let i = 0; i < matrix.rows; i++) {
          sum += matrix.get(i, j) ** 2 / (matrix.rows - 1);
        }
        scale.push(Math.sqrt(sum));
      }
      return scale;
    }
    function scaleByColumn(matrix, scale) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) / scale[j]);
        }
      }
    }
    function getScaleAll(matrix) {
      const divider = matrix.size - 1;
      let sum = 0;
      for (let j = 0; j < matrix.columns; j++) {
        for (let i = 0; i < matrix.rows; i++) {
          sum += matrix.get(i, j) ** 2 / divider;
        }
      }
      return Math.sqrt(sum);
    }
    function scaleAll(matrix, scale) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) / scale);
        }
      }
    }
    var AbstractMatrix = class _AbstractMatrix {
      static from1DArray(newRows, newColumns, newData) {
        let length = newRows * newColumns;
        if (length !== newData.length) {
          throw new RangeError("data length does not match given dimensions");
        }
        let newMatrix = new Matrix(newRows, newColumns);
        for (let row = 0; row < newRows; row++) {
          for (let column = 0; column < newColumns; column++) {
            newMatrix.set(row, column, newData[row * newColumns + column]);
          }
        }
        return newMatrix;
      }
      static rowVector(newData) {
        let vector = new Matrix(1, newData.length);
        for (let i = 0; i < newData.length; i++) {
          vector.set(0, i, newData[i]);
        }
        return vector;
      }
      static columnVector(newData) {
        let vector = new Matrix(newData.length, 1);
        for (let i = 0; i < newData.length; i++) {
          vector.set(i, 0, newData[i]);
        }
        return vector;
      }
      static zeros(rows, columns) {
        return new Matrix(rows, columns);
      }
      static ones(rows, columns) {
        return new Matrix(rows, columns).fill(1);
      }
      static rand(rows, columns, options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { random = Math.random } = options;
        let matrix = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            matrix.set(i, j, random());
          }
        }
        return matrix;
      }
      static randInt(rows, columns, options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { min = 0, max = 1e3, random = Math.random } = options;
        if (!Number.isInteger(min))
          throw new TypeError("min must be an integer");
        if (!Number.isInteger(max))
          throw new TypeError("max must be an integer");
        if (min >= max)
          throw new RangeError("min must be smaller than max");
        let interval = max - min;
        let matrix = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            let value = min + Math.round(random() * interval);
            matrix.set(i, j, value);
          }
        }
        return matrix;
      }
      static eye(rows, columns, value) {
        if (columns === void 0)
          columns = rows;
        if (value === void 0)
          value = 1;
        let min = Math.min(rows, columns);
        let matrix = this.zeros(rows, columns);
        for (let i = 0; i < min; i++) {
          matrix.set(i, i, value);
        }
        return matrix;
      }
      static diag(data, rows, columns) {
        let l = data.length;
        if (rows === void 0)
          rows = l;
        if (columns === void 0)
          columns = rows;
        let min = Math.min(l, rows, columns);
        let matrix = this.zeros(rows, columns);
        for (let i = 0; i < min; i++) {
          matrix.set(i, i, data[i]);
        }
        return matrix;
      }
      static min(matrix1, matrix2) {
        matrix1 = this.checkMatrix(matrix1);
        matrix2 = this.checkMatrix(matrix2);
        let rows = matrix1.rows;
        let columns = matrix1.columns;
        let result = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
          }
        }
        return result;
      }
      static max(matrix1, matrix2) {
        matrix1 = this.checkMatrix(matrix1);
        matrix2 = this.checkMatrix(matrix2);
        let rows = matrix1.rows;
        let columns = matrix1.columns;
        let result = new this(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
          }
        }
        return result;
      }
      static checkMatrix(value) {
        return _AbstractMatrix.isMatrix(value) ? value : new Matrix(value);
      }
      static isMatrix(value) {
        return value != null && value.klass === "Matrix";
      }
      get size() {
        return this.rows * this.columns;
      }
      apply(callback) {
        if (typeof callback !== "function") {
          throw new TypeError("callback must be a function");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            callback.call(this, i, j);
          }
        }
        return this;
      }
      to1DArray() {
        let array = [];
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            array.push(this.get(i, j));
          }
        }
        return array;
      }
      to2DArray() {
        let copy = [];
        for (let i = 0; i < this.rows; i++) {
          copy.push([]);
          for (let j = 0; j < this.columns; j++) {
            copy[i].push(this.get(i, j));
          }
        }
        return copy;
      }
      toJSON() {
        return this.to2DArray();
      }
      isRowVector() {
        return this.rows === 1;
      }
      isColumnVector() {
        return this.columns === 1;
      }
      isVector() {
        return this.rows === 1 || this.columns === 1;
      }
      isSquare() {
        return this.rows === this.columns;
      }
      isEmpty() {
        return this.rows === 0 || this.columns === 0;
      }
      isSymmetric() {
        if (this.isSquare()) {
          for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j <= i; j++) {
              if (this.get(i, j) !== this.get(j, i)) {
                return false;
              }
            }
          }
          return true;
        }
        return false;
      }
      isDistance() {
        if (!this.isSymmetric())
          return false;
        for (let i = 0; i < this.rows; i++) {
          if (this.get(i, i) !== 0)
            return false;
        }
        return true;
      }
      isEchelonForm() {
        let i = 0;
        let j = 0;
        let previousColumn = -1;
        let isEchelonForm = true;
        let checked = false;
        while (i < this.rows && isEchelonForm) {
          j = 0;
          checked = false;
          while (j < this.columns && checked === false) {
            if (this.get(i, j) === 0) {
              j++;
            } else if (this.get(i, j) === 1 && j > previousColumn) {
              checked = true;
              previousColumn = j;
            } else {
              isEchelonForm = false;
              checked = true;
            }
          }
          i++;
        }
        return isEchelonForm;
      }
      isReducedEchelonForm() {
        let i = 0;
        let j = 0;
        let previousColumn = -1;
        let isReducedEchelonForm = true;
        let checked = false;
        while (i < this.rows && isReducedEchelonForm) {
          j = 0;
          checked = false;
          while (j < this.columns && checked === false) {
            if (this.get(i, j) === 0) {
              j++;
            } else if (this.get(i, j) === 1 && j > previousColumn) {
              checked = true;
              previousColumn = j;
            } else {
              isReducedEchelonForm = false;
              checked = true;
            }
          }
          for (let k = j + 1; k < this.rows; k++) {
            if (this.get(i, k) !== 0) {
              isReducedEchelonForm = false;
            }
          }
          i++;
        }
        return isReducedEchelonForm;
      }
      echelonForm() {
        let result = this.clone();
        let h = 0;
        let k = 0;
        while (h < result.rows && k < result.columns) {
          let iMax = h;
          for (let i = h; i < result.rows; i++) {
            if (result.get(i, k) > result.get(iMax, k)) {
              iMax = i;
            }
          }
          if (result.get(iMax, k) === 0) {
            k++;
          } else {
            result.swapRows(h, iMax);
            let tmp = result.get(h, k);
            for (let j = k; j < result.columns; j++) {
              result.set(h, j, result.get(h, j) / tmp);
            }
            for (let i = h + 1; i < result.rows; i++) {
              let factor = result.get(i, k) / result.get(h, k);
              result.set(i, k, 0);
              for (let j = k + 1; j < result.columns; j++) {
                result.set(i, j, result.get(i, j) - result.get(h, j) * factor);
              }
            }
            h++;
            k++;
          }
        }
        return result;
      }
      reducedEchelonForm() {
        let result = this.echelonForm();
        let m = result.columns;
        let n = result.rows;
        let h = n - 1;
        while (h >= 0) {
          if (result.maxRow(h) === 0) {
            h--;
          } else {
            let p = 0;
            let pivot = false;
            while (p < n && pivot === false) {
              if (result.get(h, p) === 1) {
                pivot = true;
              } else {
                p++;
              }
            }
            for (let i = 0; i < h; i++) {
              let factor = result.get(i, p);
              for (let j = p; j < m; j++) {
                let tmp = result.get(i, j) - factor * result.get(h, j);
                result.set(i, j, tmp);
              }
            }
            h--;
          }
        }
        return result;
      }
      set() {
        throw new Error("set method is unimplemented");
      }
      get() {
        throw new Error("get method is unimplemented");
      }
      repeat(options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { rows = 1, columns = 1 } = options;
        if (!Number.isInteger(rows) || rows <= 0) {
          throw new TypeError("rows must be a positive integer");
        }
        if (!Number.isInteger(columns) || columns <= 0) {
          throw new TypeError("columns must be a positive integer");
        }
        let matrix = new Matrix(this.rows * rows, this.columns * columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            matrix.setSubMatrix(this, this.rows * i, this.columns * j);
          }
        }
        return matrix;
      }
      fill(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, value);
          }
        }
        return this;
      }
      neg() {
        return this.mulS(-1);
      }
      getRow(index) {
        checkRowIndex(this, index);
        let row = [];
        for (let i = 0; i < this.columns; i++) {
          row.push(this.get(index, i));
        }
        return row;
      }
      getRowVector(index) {
        return Matrix.rowVector(this.getRow(index));
      }
      setRow(index, array) {
        checkRowIndex(this, index);
        array = checkRowVector(this, array);
        for (let i = 0; i < this.columns; i++) {
          this.set(index, i, array[i]);
        }
        return this;
      }
      swapRows(row1, row2) {
        checkRowIndex(this, row1);
        checkRowIndex(this, row2);
        for (let i = 0; i < this.columns; i++) {
          let temp = this.get(row1, i);
          this.set(row1, i, this.get(row2, i));
          this.set(row2, i, temp);
        }
        return this;
      }
      getColumn(index) {
        checkColumnIndex(this, index);
        let column = [];
        for (let i = 0; i < this.rows; i++) {
          column.push(this.get(i, index));
        }
        return column;
      }
      getColumnVector(index) {
        return Matrix.columnVector(this.getColumn(index));
      }
      setColumn(index, array) {
        checkColumnIndex(this, index);
        array = checkColumnVector(this, array);
        for (let i = 0; i < this.rows; i++) {
          this.set(i, index, array[i]);
        }
        return this;
      }
      swapColumns(column1, column2) {
        checkColumnIndex(this, column1);
        checkColumnIndex(this, column2);
        for (let i = 0; i < this.rows; i++) {
          let temp = this.get(i, column1);
          this.set(i, column1, this.get(i, column2));
          this.set(i, column2, temp);
        }
        return this;
      }
      addRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + vector[j]);
          }
        }
        return this;
      }
      subRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - vector[j]);
          }
        }
        return this;
      }
      mulRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * vector[j]);
          }
        }
        return this;
      }
      divRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / vector[j]);
          }
        }
        return this;
      }
      addColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + vector[i]);
          }
        }
        return this;
      }
      subColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - vector[i]);
          }
        }
        return this;
      }
      mulColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * vector[i]);
          }
        }
        return this;
      }
      divColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / vector[i]);
          }
        }
        return this;
      }
      mulRow(index, value) {
        checkRowIndex(this, index);
        for (let i = 0; i < this.columns; i++) {
          this.set(index, i, this.get(index, i) * value);
        }
        return this;
      }
      mulColumn(index, value) {
        checkColumnIndex(this, index);
        for (let i = 0; i < this.rows; i++) {
          this.set(i, index, this.get(i, index) * value);
        }
        return this;
      }
      max(by) {
        if (this.isEmpty()) {
          return NaN;
        }
        switch (by) {
          case "row": {
            const max = new Array(this.rows).fill(Number.NEGATIVE_INFINITY);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) > max[row]) {
                  max[row] = this.get(row, column);
                }
              }
            }
            return max;
          }
          case "column": {
            const max = new Array(this.columns).fill(Number.NEGATIVE_INFINITY);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) > max[column]) {
                  max[column] = this.get(row, column);
                }
              }
            }
            return max;
          }
          case void 0: {
            let max = this.get(0, 0);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) > max) {
                  max = this.get(row, column);
                }
              }
            }
            return max;
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      maxIndex() {
        checkNonEmpty(this);
        let v = this.get(0, 0);
        let idx = [0, 0];
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            if (this.get(i, j) > v) {
              v = this.get(i, j);
              idx[0] = i;
              idx[1] = j;
            }
          }
        }
        return idx;
      }
      min(by) {
        if (this.isEmpty()) {
          return NaN;
        }
        switch (by) {
          case "row": {
            const min = new Array(this.rows).fill(Number.POSITIVE_INFINITY);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) < min[row]) {
                  min[row] = this.get(row, column);
                }
              }
            }
            return min;
          }
          case "column": {
            const min = new Array(this.columns).fill(Number.POSITIVE_INFINITY);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) < min[column]) {
                  min[column] = this.get(row, column);
                }
              }
            }
            return min;
          }
          case void 0: {
            let min = this.get(0, 0);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) < min) {
                  min = this.get(row, column);
                }
              }
            }
            return min;
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      minIndex() {
        checkNonEmpty(this);
        let v = this.get(0, 0);
        let idx = [0, 0];
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            if (this.get(i, j) < v) {
              v = this.get(i, j);
              idx[0] = i;
              idx[1] = j;
            }
          }
        }
        return idx;
      }
      maxRow(row) {
        checkRowIndex(this, row);
        if (this.isEmpty()) {
          return NaN;
        }
        let v = this.get(row, 0);
        for (let i = 1; i < this.columns; i++) {
          if (this.get(row, i) > v) {
            v = this.get(row, i);
          }
        }
        return v;
      }
      maxRowIndex(row) {
        checkRowIndex(this, row);
        checkNonEmpty(this);
        let v = this.get(row, 0);
        let idx = [row, 0];
        for (let i = 1; i < this.columns; i++) {
          if (this.get(row, i) > v) {
            v = this.get(row, i);
            idx[1] = i;
          }
        }
        return idx;
      }
      minRow(row) {
        checkRowIndex(this, row);
        if (this.isEmpty()) {
          return NaN;
        }
        let v = this.get(row, 0);
        for (let i = 1; i < this.columns; i++) {
          if (this.get(row, i) < v) {
            v = this.get(row, i);
          }
        }
        return v;
      }
      minRowIndex(row) {
        checkRowIndex(this, row);
        checkNonEmpty(this);
        let v = this.get(row, 0);
        let idx = [row, 0];
        for (let i = 1; i < this.columns; i++) {
          if (this.get(row, i) < v) {
            v = this.get(row, i);
            idx[1] = i;
          }
        }
        return idx;
      }
      maxColumn(column) {
        checkColumnIndex(this, column);
        if (this.isEmpty()) {
          return NaN;
        }
        let v = this.get(0, column);
        for (let i = 1; i < this.rows; i++) {
          if (this.get(i, column) > v) {
            v = this.get(i, column);
          }
        }
        return v;
      }
      maxColumnIndex(column) {
        checkColumnIndex(this, column);
        checkNonEmpty(this);
        let v = this.get(0, column);
        let idx = [0, column];
        for (let i = 1; i < this.rows; i++) {
          if (this.get(i, column) > v) {
            v = this.get(i, column);
            idx[0] = i;
          }
        }
        return idx;
      }
      minColumn(column) {
        checkColumnIndex(this, column);
        if (this.isEmpty()) {
          return NaN;
        }
        let v = this.get(0, column);
        for (let i = 1; i < this.rows; i++) {
          if (this.get(i, column) < v) {
            v = this.get(i, column);
          }
        }
        return v;
      }
      minColumnIndex(column) {
        checkColumnIndex(this, column);
        checkNonEmpty(this);
        let v = this.get(0, column);
        let idx = [0, column];
        for (let i = 1; i < this.rows; i++) {
          if (this.get(i, column) < v) {
            v = this.get(i, column);
            idx[0] = i;
          }
        }
        return idx;
      }
      diag() {
        let min = Math.min(this.rows, this.columns);
        let diag = [];
        for (let i = 0; i < min; i++) {
          diag.push(this.get(i, i));
        }
        return diag;
      }
      norm(type = "frobenius") {
        switch (type) {
          case "max":
            return this.max();
          case "frobenius":
            return Math.sqrt(this.dot(this));
          default:
            throw new RangeError(`unknown norm type: ${type}`);
        }
      }
      cumulativeSum() {
        let sum = 0;
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            sum += this.get(i, j);
            this.set(i, j, sum);
          }
        }
        return this;
      }
      dot(vector2) {
        if (_AbstractMatrix.isMatrix(vector2))
          vector2 = vector2.to1DArray();
        let vector1 = this.to1DArray();
        if (vector1.length !== vector2.length) {
          throw new RangeError("vectors do not have the same size");
        }
        let dot = 0;
        for (let i = 0; i < vector1.length; i++) {
          dot += vector1[i] * vector2[i];
        }
        return dot;
      }
      mmul(other) {
        other = Matrix.checkMatrix(other);
        let m = this.rows;
        let n = this.columns;
        let p = other.columns;
        let result = new Matrix(m, p);
        let Bcolj = new Float64Array(n);
        for (let j = 0; j < p; j++) {
          for (let k = 0; k < n; k++) {
            Bcolj[k] = other.get(k, j);
          }
          for (let i = 0; i < m; i++) {
            let s = 0;
            for (let k = 0; k < n; k++) {
              s += this.get(i, k) * Bcolj[k];
            }
            result.set(i, j, s);
          }
        }
        return result;
      }
      mpow(scalar) {
        if (!this.isSquare()) {
          throw new RangeError("Matrix must be square");
        }
        if (!Number.isInteger(scalar) || scalar < 0) {
          throw new RangeError("Exponent must be a non-negative integer");
        }
        let result = Matrix.eye(this.rows);
        let bb = this;
        for (let e = scalar; e >= 1; e /= 2) {
          if ((e & 1) !== 0) {
            result = result.mmul(bb);
          }
          bb = bb.mmul(bb);
        }
        return result;
      }
      strassen2x2(other) {
        other = Matrix.checkMatrix(other);
        let result = new Matrix(2, 2);
        const a11 = this.get(0, 0);
        const b11 = other.get(0, 0);
        const a12 = this.get(0, 1);
        const b12 = other.get(0, 1);
        const a21 = this.get(1, 0);
        const b21 = other.get(1, 0);
        const a22 = this.get(1, 1);
        const b22 = other.get(1, 1);
        const m1 = (a11 + a22) * (b11 + b22);
        const m2 = (a21 + a22) * b11;
        const m3 = a11 * (b12 - b22);
        const m4 = a22 * (b21 - b11);
        const m5 = (a11 + a12) * b22;
        const m6 = (a21 - a11) * (b11 + b12);
        const m7 = (a12 - a22) * (b21 + b22);
        const c00 = m1 + m4 - m5 + m7;
        const c01 = m3 + m5;
        const c10 = m2 + m4;
        const c11 = m1 - m2 + m3 + m6;
        result.set(0, 0, c00);
        result.set(0, 1, c01);
        result.set(1, 0, c10);
        result.set(1, 1, c11);
        return result;
      }
      strassen3x3(other) {
        other = Matrix.checkMatrix(other);
        let result = new Matrix(3, 3);
        const a00 = this.get(0, 0);
        const a01 = this.get(0, 1);
        const a02 = this.get(0, 2);
        const a10 = this.get(1, 0);
        const a11 = this.get(1, 1);
        const a12 = this.get(1, 2);
        const a20 = this.get(2, 0);
        const a21 = this.get(2, 1);
        const a22 = this.get(2, 2);
        const b00 = other.get(0, 0);
        const b01 = other.get(0, 1);
        const b02 = other.get(0, 2);
        const b10 = other.get(1, 0);
        const b11 = other.get(1, 1);
        const b12 = other.get(1, 2);
        const b20 = other.get(2, 0);
        const b21 = other.get(2, 1);
        const b22 = other.get(2, 2);
        const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
        const m2 = (a00 - a10) * (-b01 + b11);
        const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
        const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
        const m5 = (a10 + a11) * (-b00 + b01);
        const m6 = a00 * b00;
        const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
        const m8 = (-a00 + a20) * (b02 - b12);
        const m9 = (a20 + a21) * (-b00 + b02);
        const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
        const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
        const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
        const m13 = (a02 - a22) * (b11 - b21);
        const m14 = a02 * b20;
        const m15 = (a21 + a22) * (-b20 + b21);
        const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
        const m17 = (a02 - a12) * (b12 - b22);
        const m18 = (a11 + a12) * (-b20 + b22);
        const m19 = a01 * b10;
        const m20 = a12 * b21;
        const m21 = a10 * b02;
        const m22 = a20 * b01;
        const m23 = a22 * b22;
        const c00 = m6 + m14 + m19;
        const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
        const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
        const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
        const c11 = m2 + m4 + m5 + m6 + m20;
        const c12 = m14 + m16 + m17 + m18 + m21;
        const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
        const c21 = m12 + m13 + m14 + m15 + m22;
        const c22 = m6 + m7 + m8 + m9 + m23;
        result.set(0, 0, c00);
        result.set(0, 1, c01);
        result.set(0, 2, c02);
        result.set(1, 0, c10);
        result.set(1, 1, c11);
        result.set(1, 2, c12);
        result.set(2, 0, c20);
        result.set(2, 1, c21);
        result.set(2, 2, c22);
        return result;
      }
      mmulStrassen(y) {
        y = Matrix.checkMatrix(y);
        let x = this.clone();
        let r1 = x.rows;
        let c1 = x.columns;
        let r2 = y.rows;
        let c2 = y.columns;
        if (c1 !== r2) {
          console.warn(
            `Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`
          );
        }
        function embed(mat, rows, cols) {
          let r3 = mat.rows;
          let c3 = mat.columns;
          if (r3 === rows && c3 === cols) {
            return mat;
          } else {
            let resultat = _AbstractMatrix.zeros(rows, cols);
            resultat = resultat.setSubMatrix(mat, 0, 0);
            return resultat;
          }
        }
        let r = Math.max(r1, r2);
        let c = Math.max(c1, c2);
        x = embed(x, r, c);
        y = embed(y, r, c);
        function blockMult(a, b, rows, cols) {
          if (rows <= 512 || cols <= 512) {
            return a.mmul(b);
          }
          if (rows % 2 === 1 && cols % 2 === 1) {
            a = embed(a, rows + 1, cols + 1);
            b = embed(b, rows + 1, cols + 1);
          } else if (rows % 2 === 1) {
            a = embed(a, rows + 1, cols);
            b = embed(b, rows + 1, cols);
          } else if (cols % 2 === 1) {
            a = embed(a, rows, cols + 1);
            b = embed(b, rows, cols + 1);
          }
          let halfRows = parseInt(a.rows / 2, 10);
          let halfCols = parseInt(a.columns / 2, 10);
          let a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
          let b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);
          let a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
          let b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);
          let a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
          let b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);
          let a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
          let b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);
          let m1 = blockMult(
            _AbstractMatrix.add(a11, a22),
            _AbstractMatrix.add(b11, b22),
            halfRows,
            halfCols
          );
          let m2 = blockMult(_AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
          let m3 = blockMult(a11, _AbstractMatrix.sub(b12, b22), halfRows, halfCols);
          let m4 = blockMult(a22, _AbstractMatrix.sub(b21, b11), halfRows, halfCols);
          let m5 = blockMult(_AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
          let m6 = blockMult(
            _AbstractMatrix.sub(a21, a11),
            _AbstractMatrix.add(b11, b12),
            halfRows,
            halfCols
          );
          let m7 = blockMult(
            _AbstractMatrix.sub(a12, a22),
            _AbstractMatrix.add(b21, b22),
            halfRows,
            halfCols
          );
          let c11 = _AbstractMatrix.add(m1, m4);
          c11.sub(m5);
          c11.add(m7);
          let c12 = _AbstractMatrix.add(m3, m5);
          let c21 = _AbstractMatrix.add(m2, m4);
          let c22 = _AbstractMatrix.sub(m1, m2);
          c22.add(m3);
          c22.add(m6);
          let result = _AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
          result = result.setSubMatrix(c11, 0, 0);
          result = result.setSubMatrix(c12, c11.rows, 0);
          result = result.setSubMatrix(c21, 0, c11.columns);
          result = result.setSubMatrix(c22, c11.rows, c11.columns);
          return result.subMatrix(0, rows - 1, 0, cols - 1);
        }
        return blockMult(x, y, r, c);
      }
      scaleRows(options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { min = 0, max = 1 } = options;
        if (!Number.isFinite(min))
          throw new TypeError("min must be a number");
        if (!Number.isFinite(max))
          throw new TypeError("max must be a number");
        if (min >= max)
          throw new RangeError("min must be smaller than max");
        let newMatrix = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.rows; i++) {
          const row = this.getRow(i);
          if (row.length > 0) {
            rescale(row, { min, max, output: row });
          }
          newMatrix.setRow(i, row);
        }
        return newMatrix;
      }
      scaleColumns(options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { min = 0, max = 1 } = options;
        if (!Number.isFinite(min))
          throw new TypeError("min must be a number");
        if (!Number.isFinite(max))
          throw new TypeError("max must be a number");
        if (min >= max)
          throw new RangeError("min must be smaller than max");
        let newMatrix = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.columns; i++) {
          const column = this.getColumn(i);
          if (column.length) {
            rescale(column, {
              min,
              max,
              output: column
            });
          }
          newMatrix.setColumn(i, column);
        }
        return newMatrix;
      }
      flipRows() {
        const middle = Math.ceil(this.columns / 2);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < middle; j++) {
            let first = this.get(i, j);
            let last = this.get(i, this.columns - 1 - j);
            this.set(i, j, last);
            this.set(i, this.columns - 1 - j, first);
          }
        }
        return this;
      }
      flipColumns() {
        const middle = Math.ceil(this.rows / 2);
        for (let j = 0; j < this.columns; j++) {
          for (let i = 0; i < middle; i++) {
            let first = this.get(i, j);
            let last = this.get(this.rows - 1 - i, j);
            this.set(i, j, last);
            this.set(this.rows - 1 - i, j, first);
          }
        }
        return this;
      }
      kroneckerProduct(other) {
        other = Matrix.checkMatrix(other);
        let m = this.rows;
        let n = this.columns;
        let p = other.rows;
        let q = other.columns;
        let result = new Matrix(m * p, n * q);
        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            for (let k = 0; k < p; k++) {
              for (let l = 0; l < q; l++) {
                result.set(p * i + k, q * j + l, this.get(i, j) * other.get(k, l));
              }
            }
          }
        }
        return result;
      }
      kroneckerSum(other) {
        other = Matrix.checkMatrix(other);
        if (!this.isSquare() || !other.isSquare()) {
          throw new Error("Kronecker Sum needs two Square Matrices");
        }
        let m = this.rows;
        let n = other.rows;
        let AxI = this.kroneckerProduct(Matrix.eye(n, n));
        let IxB = Matrix.eye(m, m).kroneckerProduct(other);
        return AxI.add(IxB);
      }
      transpose() {
        let result = new Matrix(this.columns, this.rows);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            result.set(j, i, this.get(i, j));
          }
        }
        return result;
      }
      sortRows(compareFunction = compareNumbers) {
        for (let i = 0; i < this.rows; i++) {
          this.setRow(i, this.getRow(i).sort(compareFunction));
        }
        return this;
      }
      sortColumns(compareFunction = compareNumbers) {
        for (let i = 0; i < this.columns; i++) {
          this.setColumn(i, this.getColumn(i).sort(compareFunction));
        }
        return this;
      }
      subMatrix(startRow, endRow, startColumn, endColumn) {
        checkRange(this, startRow, endRow, startColumn, endColumn);
        let newMatrix = new Matrix(
          endRow - startRow + 1,
          endColumn - startColumn + 1
        );
        for (let i = startRow; i <= endRow; i++) {
          for (let j = startColumn; j <= endColumn; j++) {
            newMatrix.set(i - startRow, j - startColumn, this.get(i, j));
          }
        }
        return newMatrix;
      }
      subMatrixRow(indices, startColumn, endColumn) {
        if (startColumn === void 0)
          startColumn = 0;
        if (endColumn === void 0)
          endColumn = this.columns - 1;
        if (startColumn > endColumn || startColumn < 0 || startColumn >= this.columns || endColumn < 0 || endColumn >= this.columns) {
          throw new RangeError("Argument out of range");
        }
        let newMatrix = new Matrix(indices.length, endColumn - startColumn + 1);
        for (let i = 0; i < indices.length; i++) {
          for (let j = startColumn; j <= endColumn; j++) {
            if (indices[i] < 0 || indices[i] >= this.rows) {
              throw new RangeError(`Row index out of range: ${indices[i]}`);
            }
            newMatrix.set(i, j - startColumn, this.get(indices[i], j));
          }
        }
        return newMatrix;
      }
      subMatrixColumn(indices, startRow, endRow) {
        if (startRow === void 0)
          startRow = 0;
        if (endRow === void 0)
          endRow = this.rows - 1;
        if (startRow > endRow || startRow < 0 || startRow >= this.rows || endRow < 0 || endRow >= this.rows) {
          throw new RangeError("Argument out of range");
        }
        let newMatrix = new Matrix(endRow - startRow + 1, indices.length);
        for (let i = 0; i < indices.length; i++) {
          for (let j = startRow; j <= endRow; j++) {
            if (indices[i] < 0 || indices[i] >= this.columns) {
              throw new RangeError(`Column index out of range: ${indices[i]}`);
            }
            newMatrix.set(j - startRow, i, this.get(j, indices[i]));
          }
        }
        return newMatrix;
      }
      setSubMatrix(matrix, startRow, startColumn) {
        matrix = Matrix.checkMatrix(matrix);
        if (matrix.isEmpty()) {
          return this;
        }
        let endRow = startRow + matrix.rows - 1;
        let endColumn = startColumn + matrix.columns - 1;
        checkRange(this, startRow, endRow, startColumn, endColumn);
        for (let i = 0; i < matrix.rows; i++) {
          for (let j = 0; j < matrix.columns; j++) {
            this.set(startRow + i, startColumn + j, matrix.get(i, j));
          }
        }
        return this;
      }
      selection(rowIndices, columnIndices) {
        checkRowIndices(this, rowIndices);
        checkColumnIndices(this, columnIndices);
        let newMatrix = new Matrix(rowIndices.length, columnIndices.length);
        for (let i = 0; i < rowIndices.length; i++) {
          let rowIndex = rowIndices[i];
          for (let j = 0; j < columnIndices.length; j++) {
            let columnIndex = columnIndices[j];
            newMatrix.set(i, j, this.get(rowIndex, columnIndex));
          }
        }
        return newMatrix;
      }
      trace() {
        let min = Math.min(this.rows, this.columns);
        let trace = 0;
        for (let i = 0; i < min; i++) {
          trace += this.get(i, i);
        }
        return trace;
      }
      clone() {
        return this.constructor.copy(this, new Matrix(this.rows, this.columns));
      }
      /**
       * @template {AbstractMatrix} M
       * @param {AbstractMatrix} from
       * @param {M} to
       * @return {M}
       */
      static copy(from, to) {
        for (const [row, column, value] of from.entries()) {
          to.set(row, column, value);
        }
        return to;
      }
      sum(by) {
        switch (by) {
          case "row":
            return sumByRow(this);
          case "column":
            return sumByColumn(this);
          case void 0:
            return sumAll(this);
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      product(by) {
        switch (by) {
          case "row":
            return productByRow(this);
          case "column":
            return productByColumn(this);
          case void 0:
            return productAll(this);
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      mean(by) {
        const sum = this.sum(by);
        switch (by) {
          case "row": {
            for (let i = 0; i < this.rows; i++) {
              sum[i] /= this.columns;
            }
            return sum;
          }
          case "column": {
            for (let i = 0; i < this.columns; i++) {
              sum[i] /= this.rows;
            }
            return sum;
          }
          case void 0:
            return sum / this.size;
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      variance(by, options = {}) {
        if (typeof by === "object") {
          options = by;
          by = void 0;
        }
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { unbiased = true, mean = this.mean(by) } = options;
        if (typeof unbiased !== "boolean") {
          throw new TypeError("unbiased must be a boolean");
        }
        switch (by) {
          case "row": {
            if (!isAnyArray.isAnyArray(mean)) {
              throw new TypeError("mean must be an array");
            }
            return varianceByRow(this, unbiased, mean);
          }
          case "column": {
            if (!isAnyArray.isAnyArray(mean)) {
              throw new TypeError("mean must be an array");
            }
            return varianceByColumn(this, unbiased, mean);
          }
          case void 0: {
            if (typeof mean !== "number") {
              throw new TypeError("mean must be a number");
            }
            return varianceAll(this, unbiased, mean);
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      standardDeviation(by, options) {
        if (typeof by === "object") {
          options = by;
          by = void 0;
        }
        const variance = this.variance(by, options);
        if (by === void 0) {
          return Math.sqrt(variance);
        } else {
          for (let i = 0; i < variance.length; i++) {
            variance[i] = Math.sqrt(variance[i]);
          }
          return variance;
        }
      }
      center(by, options = {}) {
        if (typeof by === "object") {
          options = by;
          by = void 0;
        }
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { center = this.mean(by) } = options;
        switch (by) {
          case "row": {
            if (!isAnyArray.isAnyArray(center)) {
              throw new TypeError("center must be an array");
            }
            centerByRow(this, center);
            return this;
          }
          case "column": {
            if (!isAnyArray.isAnyArray(center)) {
              throw new TypeError("center must be an array");
            }
            centerByColumn(this, center);
            return this;
          }
          case void 0: {
            if (typeof center !== "number") {
              throw new TypeError("center must be a number");
            }
            centerAll(this, center);
            return this;
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      scale(by, options = {}) {
        if (typeof by === "object") {
          options = by;
          by = void 0;
        }
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        let scale = options.scale;
        switch (by) {
          case "row": {
            if (scale === void 0) {
              scale = getScaleByRow(this);
            } else if (!isAnyArray.isAnyArray(scale)) {
              throw new TypeError("scale must be an array");
            }
            scaleByRow(this, scale);
            return this;
          }
          case "column": {
            if (scale === void 0) {
              scale = getScaleByColumn(this);
            } else if (!isAnyArray.isAnyArray(scale)) {
              throw new TypeError("scale must be an array");
            }
            scaleByColumn(this, scale);
            return this;
          }
          case void 0: {
            if (scale === void 0) {
              scale = getScaleAll(this);
            } else if (typeof scale !== "number") {
              throw new TypeError("scale must be a number");
            }
            scaleAll(this, scale);
            return this;
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      toString(options) {
        return inspectMatrixWithOptions(this, options);
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      /**
       * iterator from left to right, from top to bottom
       * yield [row, column, value]
       * @returns {Generator<[number, number, number], void, void>}
       */
      *entries() {
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.columns; col++) {
            yield [row, col, this.get(row, col)];
          }
        }
      }
      /**
       * iterator from left to right, from top to bottom
       * yield value
       * @returns {Generator<number, void, void>}
       */
      *values() {
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.columns; col++) {
            yield this.get(row, col);
          }
        }
      }
    };
    AbstractMatrix.prototype.klass = "Matrix";
    if (typeof Symbol !== "undefined") {
      AbstractMatrix.prototype[Symbol.for("nodejs.util.inspect.custom")] = inspectMatrix;
    }
    function compareNumbers(a, b) {
      return a - b;
    }
    function isArrayOfNumbers(array) {
      return array.every((element) => {
        return typeof element === "number";
      });
    }
    AbstractMatrix.random = AbstractMatrix.rand;
    AbstractMatrix.randomInt = AbstractMatrix.randInt;
    AbstractMatrix.diagonal = AbstractMatrix.diag;
    AbstractMatrix.prototype.diagonal = AbstractMatrix.prototype.diag;
    AbstractMatrix.identity = AbstractMatrix.eye;
    AbstractMatrix.prototype.negate = AbstractMatrix.prototype.neg;
    AbstractMatrix.prototype.tensorProduct = AbstractMatrix.prototype.kroneckerProduct;
    var _initData, initData_fn;
    var _Matrix = class _Matrix extends AbstractMatrix {
      constructor(nRows, nColumns) {
        super();
        /**
         * Init an empty matrix
         * @param {number} nRows
         * @param {number} nColumns
         */
        __privateAdd(this, _initData);
        /**
         * @type {Float64Array[]}
         */
        __publicField(this, "data");
        if (_Matrix.isMatrix(nRows)) {
          __privateMethod(this, _initData, initData_fn).call(this, nRows.rows, nRows.columns);
          _Matrix.copy(nRows, this);
        } else if (Number.isInteger(nRows) && nRows >= 0) {
          __privateMethod(this, _initData, initData_fn).call(this, nRows, nColumns);
        } else if (isAnyArray.isAnyArray(nRows)) {
          const arrayData = nRows;
          nRows = arrayData.length;
          nColumns = nRows ? arrayData[0].length : 0;
          if (typeof nColumns !== "number") {
            throw new TypeError(
              "Data must be a 2D array with at least one element"
            );
          }
          this.data = [];
          for (let i = 0; i < nRows; i++) {
            if (arrayData[i].length !== nColumns) {
              throw new RangeError("Inconsistent array dimensions");
            }
            if (!isArrayOfNumbers(arrayData[i])) {
              throw new TypeError("Input data contains non-numeric values");
            }
            this.data.push(Float64Array.from(arrayData[i]));
          }
          this.rows = nRows;
          this.columns = nColumns;
        } else {
          throw new TypeError(
            "First argument must be a positive number or an array"
          );
        }
      }
      set(rowIndex, columnIndex, value) {
        this.data[rowIndex][columnIndex] = value;
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.data[rowIndex][columnIndex];
      }
      removeRow(index) {
        checkRowIndex(this, index);
        this.data.splice(index, 1);
        this.rows -= 1;
        return this;
      }
      addRow(index, array) {
        if (array === void 0) {
          array = index;
          index = this.rows;
        }
        checkRowIndex(this, index, true);
        array = Float64Array.from(checkRowVector(this, array));
        this.data.splice(index, 0, array);
        this.rows += 1;
        return this;
      }
      removeColumn(index) {
        checkColumnIndex(this, index);
        for (let i = 0; i < this.rows; i++) {
          const newRow = new Float64Array(this.columns - 1);
          for (let j = 0; j < index; j++) {
            newRow[j] = this.data[i][j];
          }
          for (let j = index + 1; j < this.columns; j++) {
            newRow[j - 1] = this.data[i][j];
          }
          this.data[i] = newRow;
        }
        this.columns -= 1;
        return this;
      }
      addColumn(index, array) {
        if (typeof array === "undefined") {
          array = index;
          index = this.columns;
        }
        checkColumnIndex(this, index, true);
        array = checkColumnVector(this, array);
        for (let i = 0; i < this.rows; i++) {
          const newRow = new Float64Array(this.columns + 1);
          let j = 0;
          for (; j < index; j++) {
            newRow[j] = this.data[i][j];
          }
          newRow[j++] = array[i];
          for (; j < this.columns + 1; j++) {
            newRow[j] = this.data[i][j - 1];
          }
          this.data[i] = newRow;
        }
        this.columns += 1;
        return this;
      }
    };
    _initData = new WeakSet();
    initData_fn = function(nRows, nColumns) {
      this.data = [];
      if (Number.isInteger(nColumns) && nColumns >= 0) {
        for (let i = 0; i < nRows; i++) {
          this.data.push(new Float64Array(nColumns));
        }
      } else {
        throw new TypeError("nColumns must be a positive integer");
      }
      this.rows = nRows;
      this.columns = nColumns;
    };
    var Matrix = _Matrix;
    installMathOperations(AbstractMatrix, Matrix);
    var _matrix;
    var _SymmetricMatrix = class _SymmetricMatrix extends AbstractMatrix {
      /**
       * @param {number | AbstractMatrix | ArrayLike<ArrayLike<number>>} diagonalSize
       * @return {this}
       */
      constructor(diagonalSize) {
        super();
        /** @type {Matrix} */
        __privateAdd(this, _matrix, void 0);
        if (Matrix.isMatrix(diagonalSize)) {
          if (!diagonalSize.isSymmetric()) {
            throw new TypeError("not symmetric data");
          }
          __privateSet(this, _matrix, Matrix.copy(
            diagonalSize,
            new Matrix(diagonalSize.rows, diagonalSize.rows)
          ));
        } else if (Number.isInteger(diagonalSize) && diagonalSize >= 0) {
          __privateSet(this, _matrix, new Matrix(diagonalSize, diagonalSize));
        } else {
          __privateSet(this, _matrix, new Matrix(diagonalSize));
          if (!this.isSymmetric()) {
            throw new TypeError("not symmetric data");
          }
        }
      }
      get size() {
        return __privateGet(this, _matrix).size;
      }
      get rows() {
        return __privateGet(this, _matrix).rows;
      }
      get columns() {
        return __privateGet(this, _matrix).columns;
      }
      get diagonalSize() {
        return this.rows;
      }
      /**
       * not the same as matrix.isSymmetric()
       * Here is to check if it's instanceof SymmetricMatrix without bundling issues
       *
       * @param value
       * @returns {boolean}
       */
      static isSymmetricMatrix(value) {
        return Matrix.isMatrix(value) && value.klassType === "SymmetricMatrix";
      }
      /**
       * @param diagonalSize
       * @return {SymmetricMatrix}
       */
      static zeros(diagonalSize) {
        return new this(diagonalSize);
      }
      /**
       * @param diagonalSize
       * @return {SymmetricMatrix}
       */
      static ones(diagonalSize) {
        return new this(diagonalSize).fill(1);
      }
      clone() {
        const matrix = new _SymmetricMatrix(this.diagonalSize);
        for (const [row, col, value] of this.upperRightEntries()) {
          matrix.set(row, col, value);
        }
        return matrix;
      }
      toMatrix() {
        return new Matrix(this);
      }
      get(rowIndex, columnIndex) {
        return __privateGet(this, _matrix).get(rowIndex, columnIndex);
      }
      set(rowIndex, columnIndex, value) {
        __privateGet(this, _matrix).set(rowIndex, columnIndex, value);
        __privateGet(this, _matrix).set(columnIndex, rowIndex, value);
        return this;
      }
      removeCross(index) {
        __privateGet(this, _matrix).removeRow(index);
        __privateGet(this, _matrix).removeColumn(index);
        return this;
      }
      addCross(index, array) {
        if (array === void 0) {
          array = index;
          index = this.diagonalSize;
        }
        const row = array.slice();
        row.splice(index, 1);
        __privateGet(this, _matrix).addRow(index, row);
        __privateGet(this, _matrix).addColumn(index, array);
        return this;
      }
      /**
       * @param {Mask[]} mask
       */
      applyMask(mask) {
        if (mask.length !== this.diagonalSize) {
          throw new RangeError("Mask size do not match with matrix size");
        }
        const sidesToRemove = [];
        for (const [index, passthroughs] of mask.entries()) {
          if (passthroughs)
            continue;
          sidesToRemove.push(index);
        }
        sidesToRemove.reverse();
        for (const sideIndex of sidesToRemove) {
          this.removeCross(sideIndex);
        }
        return this;
      }
      /**
       * Compact format upper-right corner of matrix
       * iterate from left to right, from top to bottom.
       *
       * ```
       *   A B C D
       * A 1 2 3 4
       * B 2 5 6 7
       * C 3 6 8 9
       * D 4 7 9 10
       * ```
       *
       * will return compact 1D array `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`
       *
       * length is S(i=0, n=sideSize) => 10 for a 4 sideSized matrix
       *
       * @returns {number[]}
       */
      toCompact() {
        const { diagonalSize } = this;
        const compact = new Array(diagonalSize * (diagonalSize + 1) / 2);
        for (let col = 0, row = 0, index = 0; index < compact.length; index++) {
          compact[index] = this.get(row, col);
          if (++col >= diagonalSize)
            col = ++row;
        }
        return compact;
      }
      /**
       * @param {number[]} compact
       * @return {SymmetricMatrix}
       */
      static fromCompact(compact) {
        const compactSize = compact.length;
        const diagonalSize = (Math.sqrt(8 * compactSize + 1) - 1) / 2;
        if (!Number.isInteger(diagonalSize)) {
          throw new TypeError(
            `This array is not a compact representation of a Symmetric Matrix, ${JSON.stringify(
              compact
            )}`
          );
        }
        const matrix = new _SymmetricMatrix(diagonalSize);
        for (let col = 0, row = 0, index = 0; index < compactSize; index++) {
          matrix.set(col, row, compact[index]);
          if (++col >= diagonalSize)
            col = ++row;
        }
        return matrix;
      }
      /**
       * half iterator upper-right-corner from left to right, from top to bottom
       * yield [row, column, value]
       *
       * @returns {Generator<[number, number, number], void, void>}
       */
      *upperRightEntries() {
        for (let row = 0, col = 0; row < this.diagonalSize; void 0) {
          const value = this.get(row, col);
          yield [row, col, value];
          if (++col >= this.diagonalSize)
            col = ++row;
        }
      }
      /**
       * half iterator upper-right-corner from left to right, from top to bottom
       * yield value
       *
       * @returns {Generator<[number, number, number], void, void>}
       */
      *upperRightValues() {
        for (let row = 0, col = 0; row < this.diagonalSize; void 0) {
          const value = this.get(row, col);
          yield value;
          if (++col >= this.diagonalSize)
            col = ++row;
        }
      }
    };
    _matrix = new WeakMap();
    var SymmetricMatrix = _SymmetricMatrix;
    SymmetricMatrix.prototype.klassType = "SymmetricMatrix";
    var DistanceMatrix = class _DistanceMatrix extends SymmetricMatrix {
      /**
       * not the same as matrix.isSymmetric()
       * Here is to check if it's instanceof SymmetricMatrix without bundling issues
       *
       * @param value
       * @returns {boolean}
       */
      static isDistanceMatrix(value) {
        return SymmetricMatrix.isSymmetricMatrix(value) && value.klassSubType === "DistanceMatrix";
      }
      constructor(sideSize) {
        super(sideSize);
        if (!this.isDistance()) {
          throw new TypeError("Provided arguments do no produce a distance matrix");
        }
      }
      set(rowIndex, columnIndex, value) {
        if (rowIndex === columnIndex)
          value = 0;
        return super.set(rowIndex, columnIndex, value);
      }
      addCross(index, array) {
        if (array === void 0) {
          array = index;
          index = this.diagonalSize;
        }
        array = array.slice();
        array[index] = 0;
        return super.addCross(index, array);
      }
      toSymmetricMatrix() {
        return new SymmetricMatrix(this);
      }
      clone() {
        const matrix = new _DistanceMatrix(this.diagonalSize);
        for (const [row, col, value] of this.upperRightEntries()) {
          if (row === col)
            continue;
          matrix.set(row, col, value);
        }
        return matrix;
      }
      /**
       * Compact format upper-right corner of matrix
       * no diagonal (only zeros)
       * iterable from left to right, from top to bottom.
       *
       * ```
       *   A B C D
       * A 0 1 2 3
       * B 1 0 4 5
       * C 2 4 0 6
       * D 3 5 6 0
       * ```
       *
       * will return compact 1D array `[1, 2, 3, 4, 5, 6]`
       *
       * length is S(i=0, n=sideSize-1) => 6 for a 4 side sized matrix
       *
       * @returns {number[]}
       */
      toCompact() {
        const { diagonalSize } = this;
        const compactLength = (diagonalSize - 1) * diagonalSize / 2;
        const compact = new Array(compactLength);
        for (let col = 1, row = 0, index = 0; index < compact.length; index++) {
          compact[index] = this.get(row, col);
          if (++col >= diagonalSize)
            col = ++row + 1;
        }
        return compact;
      }
      /**
       * @param {number[]} compact
       */
      static fromCompact(compact) {
        const compactSize = compact.length;
        if (compactSize === 0) {
          return new this(0);
        }
        const diagonalSize = (Math.sqrt(8 * compactSize + 1) + 1) / 2;
        if (!Number.isInteger(diagonalSize)) {
          throw new TypeError(
            `This array is not a compact representation of a DistanceMatrix, ${JSON.stringify(
              compact
            )}`
          );
        }
        const matrix = new this(diagonalSize);
        for (let col = 1, row = 0, index = 0; index < compactSize; index++) {
          matrix.set(col, row, compact[index]);
          if (++col >= diagonalSize)
            col = ++row + 1;
        }
        return matrix;
      }
    };
    DistanceMatrix.prototype.klassSubType = "DistanceMatrix";
    var BaseView = class extends AbstractMatrix {
      constructor(matrix, rows, columns) {
        super();
        this.matrix = matrix;
        this.rows = rows;
        this.columns = columns;
      }
    };
    var MatrixColumnView = class extends BaseView {
      constructor(matrix, column) {
        checkColumnIndex(matrix, column);
        super(matrix, matrix.rows, 1);
        this.column = column;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.column, value);
        return this;
      }
      get(rowIndex) {
        return this.matrix.get(rowIndex, this.column);
      }
    };
    var MatrixColumnSelectionView = class extends BaseView {
      constructor(matrix, columnIndices) {
        checkColumnIndices(matrix, columnIndices);
        super(matrix, matrix.rows, columnIndices.length);
        this.columnIndices = columnIndices;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
      }
    };
    var MatrixFlipColumnView = class extends BaseView {
      constructor(matrix) {
        super(matrix, matrix.rows, matrix.columns);
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
      }
    };
    var MatrixFlipRowView = class extends BaseView {
      constructor(matrix) {
        super(matrix, matrix.rows, matrix.columns);
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
      }
    };
    var MatrixRowView = class extends BaseView {
      constructor(matrix, row) {
        checkRowIndex(matrix, row);
        super(matrix, 1, matrix.columns);
        this.row = row;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(this.row, columnIndex, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(this.row, columnIndex);
      }
    };
    var MatrixRowSelectionView = class extends BaseView {
      constructor(matrix, rowIndices) {
        checkRowIndices(matrix, rowIndices);
        super(matrix, rowIndices.length, matrix.columns);
        this.rowIndices = rowIndices;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
      }
    };
    var MatrixSelectionView = class extends BaseView {
      constructor(matrix, rowIndices, columnIndices) {
        checkRowIndices(matrix, rowIndices);
        checkColumnIndices(matrix, columnIndices);
        super(matrix, rowIndices.length, columnIndices.length);
        this.rowIndices = rowIndices;
        this.columnIndices = columnIndices;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(
          this.rowIndices[rowIndex],
          this.columnIndices[columnIndex],
          value
        );
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(
          this.rowIndices[rowIndex],
          this.columnIndices[columnIndex]
        );
      }
    };
    var MatrixSubView = class extends BaseView {
      constructor(matrix, startRow, endRow, startColumn, endColumn) {
        checkRange(matrix, startRow, endRow, startColumn, endColumn);
        super(matrix, endRow - startRow + 1, endColumn - startColumn + 1);
        this.startRow = startRow;
        this.startColumn = startColumn;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(
          this.startRow + rowIndex,
          this.startColumn + columnIndex,
          value
        );
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(
          this.startRow + rowIndex,
          this.startColumn + columnIndex
        );
      }
    };
    var MatrixTransposeView = class extends BaseView {
      constructor(matrix) {
        super(matrix, matrix.columns, matrix.rows);
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(columnIndex, rowIndex, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(columnIndex, rowIndex);
      }
    };
    var WrapperMatrix1D = class extends AbstractMatrix {
      constructor(data, options = {}) {
        const { rows = 1 } = options;
        if (data.length % rows !== 0) {
          throw new Error("the data length is not divisible by the number of rows");
        }
        super();
        this.rows = rows;
        this.columns = data.length / rows;
        this.data = data;
      }
      set(rowIndex, columnIndex, value) {
        let index = this._calculateIndex(rowIndex, columnIndex);
        this.data[index] = value;
        return this;
      }
      get(rowIndex, columnIndex) {
        let index = this._calculateIndex(rowIndex, columnIndex);
        return this.data[index];
      }
      _calculateIndex(row, column) {
        return row * this.columns + column;
      }
    };
    var WrapperMatrix2D = class extends AbstractMatrix {
      constructor(data) {
        super();
        this.data = data;
        this.rows = data.length;
        this.columns = data[0].length;
      }
      set(rowIndex, columnIndex, value) {
        this.data[rowIndex][columnIndex] = value;
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.data[rowIndex][columnIndex];
      }
    };
    function wrap(array, options) {
      if (isAnyArray.isAnyArray(array)) {
        if (array[0] && isAnyArray.isAnyArray(array[0])) {
          return new WrapperMatrix2D(array);
        } else {
          return new WrapperMatrix1D(array, options);
        }
      } else {
        throw new Error("the argument is not an array");
      }
    }
    var LuDecomposition = class {
      constructor(matrix) {
        matrix = WrapperMatrix2D.checkMatrix(matrix);
        let lu = matrix.clone();
        let rows = lu.rows;
        let columns = lu.columns;
        let pivotVector = new Float64Array(rows);
        let pivotSign = 1;
        let i, j, k, p, s, t, v;
        let LUcolj, kmax;
        for (i = 0; i < rows; i++) {
          pivotVector[i] = i;
        }
        LUcolj = new Float64Array(rows);
        for (j = 0; j < columns; j++) {
          for (i = 0; i < rows; i++) {
            LUcolj[i] = lu.get(i, j);
          }
          for (i = 0; i < rows; i++) {
            kmax = Math.min(i, j);
            s = 0;
            for (k = 0; k < kmax; k++) {
              s += lu.get(i, k) * LUcolj[k];
            }
            LUcolj[i] -= s;
            lu.set(i, j, LUcolj[i]);
          }
          p = j;
          for (i = j + 1; i < rows; i++) {
            if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
              p = i;
            }
          }
          if (p !== j) {
            for (k = 0; k < columns; k++) {
              t = lu.get(p, k);
              lu.set(p, k, lu.get(j, k));
              lu.set(j, k, t);
            }
            v = pivotVector[p];
            pivotVector[p] = pivotVector[j];
            pivotVector[j] = v;
            pivotSign = -pivotSign;
          }
          if (j < rows && lu.get(j, j) !== 0) {
            for (i = j + 1; i < rows; i++) {
              lu.set(i, j, lu.get(i, j) / lu.get(j, j));
            }
          }
        }
        this.LU = lu;
        this.pivotVector = pivotVector;
        this.pivotSign = pivotSign;
      }
      isSingular() {
        let data = this.LU;
        let col = data.columns;
        for (let j = 0; j < col; j++) {
          if (data.get(j, j) === 0) {
            return true;
          }
        }
        return false;
      }
      solve(value) {
        value = Matrix.checkMatrix(value);
        let lu = this.LU;
        let rows = lu.rows;
        if (rows !== value.rows) {
          throw new Error("Invalid matrix dimensions");
        }
        if (this.isSingular()) {
          throw new Error("LU matrix is singular");
        }
        let count = value.columns;
        let X = value.subMatrixRow(this.pivotVector, 0, count - 1);
        let columns = lu.columns;
        let i, j, k;
        for (k = 0; k < columns; k++) {
          for (i = k + 1; i < columns; i++) {
            for (j = 0; j < count; j++) {
              X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
            }
          }
        }
        for (k = columns - 1; k >= 0; k--) {
          for (j = 0; j < count; j++) {
            X.set(k, j, X.get(k, j) / lu.get(k, k));
          }
          for (i = 0; i < k; i++) {
            for (j = 0; j < count; j++) {
              X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
            }
          }
        }
        return X;
      }
      get determinant() {
        let data = this.LU;
        if (!data.isSquare()) {
          throw new Error("Matrix must be square");
        }
        let determinant2 = this.pivotSign;
        let col = data.columns;
        for (let j = 0; j < col; j++) {
          determinant2 *= data.get(j, j);
        }
        return determinant2;
      }
      get lowerTriangularMatrix() {
        let data = this.LU;
        let rows = data.rows;
        let columns = data.columns;
        let X = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            if (i > j) {
              X.set(i, j, data.get(i, j));
            } else if (i === j) {
              X.set(i, j, 1);
            } else {
              X.set(i, j, 0);
            }
          }
        }
        return X;
      }
      get upperTriangularMatrix() {
        let data = this.LU;
        let rows = data.rows;
        let columns = data.columns;
        let X = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            if (i <= j) {
              X.set(i, j, data.get(i, j));
            } else {
              X.set(i, j, 0);
            }
          }
        }
        return X;
      }
      get pivotPermutationVector() {
        return Array.from(this.pivotVector);
      }
    };
    function hypotenuse(a, b) {
      let r = 0;
      if (Math.abs(a) > Math.abs(b)) {
        r = b / a;
        return Math.abs(a) * Math.sqrt(1 + r * r);
      }
      if (b !== 0) {
        r = a / b;
        return Math.abs(b) * Math.sqrt(1 + r * r);
      }
      return 0;
    }
    var QrDecomposition = class {
      constructor(value) {
        value = WrapperMatrix2D.checkMatrix(value);
        let qr = value.clone();
        let m = value.rows;
        let n = value.columns;
        let rdiag = new Float64Array(n);
        let i, j, k, s;
        for (k = 0; k < n; k++) {
          let nrm = 0;
          for (i = k; i < m; i++) {
            nrm = hypotenuse(nrm, qr.get(i, k));
          }
          if (nrm !== 0) {
            if (qr.get(k, k) < 0) {
              nrm = -nrm;
            }
            for (i = k; i < m; i++) {
              qr.set(i, k, qr.get(i, k) / nrm);
            }
            qr.set(k, k, qr.get(k, k) + 1);
            for (j = k + 1; j < n; j++) {
              s = 0;
              for (i = k; i < m; i++) {
                s += qr.get(i, k) * qr.get(i, j);
              }
              s = -s / qr.get(k, k);
              for (i = k; i < m; i++) {
                qr.set(i, j, qr.get(i, j) + s * qr.get(i, k));
              }
            }
          }
          rdiag[k] = -nrm;
        }
        this.QR = qr;
        this.Rdiag = rdiag;
      }
      solve(value) {
        value = Matrix.checkMatrix(value);
        let qr = this.QR;
        let m = qr.rows;
        if (value.rows !== m) {
          throw new Error("Matrix row dimensions must agree");
        }
        if (!this.isFullRank()) {
          throw new Error("Matrix is rank deficient");
        }
        let count = value.columns;
        let X = value.clone();
        let n = qr.columns;
        let i, j, k, s;
        for (k = 0; k < n; k++) {
          for (j = 0; j < count; j++) {
            s = 0;
            for (i = k; i < m; i++) {
              s += qr.get(i, k) * X.get(i, j);
            }
            s = -s / qr.get(k, k);
            for (i = k; i < m; i++) {
              X.set(i, j, X.get(i, j) + s * qr.get(i, k));
            }
          }
        }
        for (k = n - 1; k >= 0; k--) {
          for (j = 0; j < count; j++) {
            X.set(k, j, X.get(k, j) / this.Rdiag[k]);
          }
          for (i = 0; i < k; i++) {
            for (j = 0; j < count; j++) {
              X.set(i, j, X.get(i, j) - X.get(k, j) * qr.get(i, k));
            }
          }
        }
        return X.subMatrix(0, n - 1, 0, count - 1);
      }
      isFullRank() {
        let columns = this.QR.columns;
        for (let i = 0; i < columns; i++) {
          if (this.Rdiag[i] === 0) {
            return false;
          }
        }
        return true;
      }
      get upperTriangularMatrix() {
        let qr = this.QR;
        let n = qr.columns;
        let X = new Matrix(n, n);
        let i, j;
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            if (i < j) {
              X.set(i, j, qr.get(i, j));
            } else if (i === j) {
              X.set(i, j, this.Rdiag[i]);
            } else {
              X.set(i, j, 0);
            }
          }
        }
        return X;
      }
      get orthogonalMatrix() {
        let qr = this.QR;
        let rows = qr.rows;
        let columns = qr.columns;
        let X = new Matrix(rows, columns);
        let i, j, k, s;
        for (k = columns - 1; k >= 0; k--) {
          for (i = 0; i < rows; i++) {
            X.set(i, k, 0);
          }
          X.set(k, k, 1);
          for (j = k; j < columns; j++) {
            if (qr.get(k, k) !== 0) {
              s = 0;
              for (i = k; i < rows; i++) {
                s += qr.get(i, k) * X.get(i, j);
              }
              s = -s / qr.get(k, k);
              for (i = k; i < rows; i++) {
                X.set(i, j, X.get(i, j) + s * qr.get(i, k));
              }
            }
          }
        }
        return X;
      }
    };
    var SingularValueDecomposition = class {
      constructor(value, options = {}) {
        value = WrapperMatrix2D.checkMatrix(value);
        if (value.isEmpty()) {
          throw new Error("Matrix must be non-empty");
        }
        let m = value.rows;
        let n = value.columns;
        const {
          computeLeftSingularVectors = true,
          computeRightSingularVectors = true,
          autoTranspose = false
        } = options;
        let wantu = Boolean(computeLeftSingularVectors);
        let wantv = Boolean(computeRightSingularVectors);
        let swapped = false;
        let a;
        if (m < n) {
          if (!autoTranspose) {
            a = value.clone();
            console.warn(
              "Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose"
            );
          } else {
            a = value.transpose();
            m = a.rows;
            n = a.columns;
            swapped = true;
            let aux = wantu;
            wantu = wantv;
            wantv = aux;
          }
        } else {
          a = value.clone();
        }
        let nu = Math.min(m, n);
        let ni = Math.min(m + 1, n);
        let s = new Float64Array(ni);
        let U = new Matrix(m, nu);
        let V = new Matrix(n, n);
        let e = new Float64Array(n);
        let work = new Float64Array(m);
        let si = new Float64Array(ni);
        for (let i = 0; i < ni; i++)
          si[i] = i;
        let nct = Math.min(m - 1, n);
        let nrt = Math.max(0, Math.min(n - 2, m));
        let mrc = Math.max(nct, nrt);
        for (let k = 0; k < mrc; k++) {
          if (k < nct) {
            s[k] = 0;
            for (let i = k; i < m; i++) {
              s[k] = hypotenuse(s[k], a.get(i, k));
            }
            if (s[k] !== 0) {
              if (a.get(k, k) < 0) {
                s[k] = -s[k];
              }
              for (let i = k; i < m; i++) {
                a.set(i, k, a.get(i, k) / s[k]);
              }
              a.set(k, k, a.get(k, k) + 1);
            }
            s[k] = -s[k];
          }
          for (let j = k + 1; j < n; j++) {
            if (k < nct && s[k] !== 0) {
              let t = 0;
              for (let i = k; i < m; i++) {
                t += a.get(i, k) * a.get(i, j);
              }
              t = -t / a.get(k, k);
              for (let i = k; i < m; i++) {
                a.set(i, j, a.get(i, j) + t * a.get(i, k));
              }
            }
            e[j] = a.get(k, j);
          }
          if (wantu && k < nct) {
            for (let i = k; i < m; i++) {
              U.set(i, k, a.get(i, k));
            }
          }
          if (k < nrt) {
            e[k] = 0;
            for (let i = k + 1; i < n; i++) {
              e[k] = hypotenuse(e[k], e[i]);
            }
            if (e[k] !== 0) {
              if (e[k + 1] < 0) {
                e[k] = 0 - e[k];
              }
              for (let i = k + 1; i < n; i++) {
                e[i] /= e[k];
              }
              e[k + 1] += 1;
            }
            e[k] = -e[k];
            if (k + 1 < m && e[k] !== 0) {
              for (let i = k + 1; i < m; i++) {
                work[i] = 0;
              }
              for (let i = k + 1; i < m; i++) {
                for (let j = k + 1; j < n; j++) {
                  work[i] += e[j] * a.get(i, j);
                }
              }
              for (let j = k + 1; j < n; j++) {
                let t = -e[j] / e[k + 1];
                for (let i = k + 1; i < m; i++) {
                  a.set(i, j, a.get(i, j) + t * work[i]);
                }
              }
            }
            if (wantv) {
              for (let i = k + 1; i < n; i++) {
                V.set(i, k, e[i]);
              }
            }
          }
        }
        let p = Math.min(n, m + 1);
        if (nct < n) {
          s[nct] = a.get(nct, nct);
        }
        if (m < p) {
          s[p - 1] = 0;
        }
        if (nrt + 1 < p) {
          e[nrt] = a.get(nrt, p - 1);
        }
        e[p - 1] = 0;
        if (wantu) {
          for (let j = nct; j < nu; j++) {
            for (let i = 0; i < m; i++) {
              U.set(i, j, 0);
            }
            U.set(j, j, 1);
          }
          for (let k = nct - 1; k >= 0; k--) {
            if (s[k] !== 0) {
              for (let j = k + 1; j < nu; j++) {
                let t = 0;
                for (let i = k; i < m; i++) {
                  t += U.get(i, k) * U.get(i, j);
                }
                t = -t / U.get(k, k);
                for (let i = k; i < m; i++) {
                  U.set(i, j, U.get(i, j) + t * U.get(i, k));
                }
              }
              for (let i = k; i < m; i++) {
                U.set(i, k, -U.get(i, k));
              }
              U.set(k, k, 1 + U.get(k, k));
              for (let i = 0; i < k - 1; i++) {
                U.set(i, k, 0);
              }
            } else {
              for (let i = 0; i < m; i++) {
                U.set(i, k, 0);
              }
              U.set(k, k, 1);
            }
          }
        }
        if (wantv) {
          for (let k = n - 1; k >= 0; k--) {
            if (k < nrt && e[k] !== 0) {
              for (let j = k + 1; j < n; j++) {
                let t = 0;
                for (let i = k + 1; i < n; i++) {
                  t += V.get(i, k) * V.get(i, j);
                }
                t = -t / V.get(k + 1, k);
                for (let i = k + 1; i < n; i++) {
                  V.set(i, j, V.get(i, j) + t * V.get(i, k));
                }
              }
            }
            for (let i = 0; i < n; i++) {
              V.set(i, k, 0);
            }
            V.set(k, k, 1);
          }
        }
        let pp = p - 1;
        let eps = Number.EPSILON;
        while (p > 0) {
          let k, kase;
          for (k = p - 2; k >= -1; k--) {
            if (k === -1) {
              break;
            }
            const alpha = Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));
            if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
              e[k] = 0;
              break;
            }
          }
          if (k === p - 2) {
            kase = 4;
          } else {
            let ks;
            for (ks = p - 1; ks >= k; ks--) {
              if (ks === k) {
                break;
              }
              let t = (ks !== p ? Math.abs(e[ks]) : 0) + (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
              if (Math.abs(s[ks]) <= eps * t) {
                s[ks] = 0;
                break;
              }
            }
            if (ks === k) {
              kase = 3;
            } else if (ks === p - 1) {
              kase = 1;
            } else {
              kase = 2;
              k = ks;
            }
          }
          k++;
          switch (kase) {
            case 1: {
              let f = e[p - 2];
              e[p - 2] = 0;
              for (let j = p - 2; j >= k; j--) {
                let t = hypotenuse(s[j], f);
                let cs = s[j] / t;
                let sn = f / t;
                s[j] = t;
                if (j !== k) {
                  f = -sn * e[j - 1];
                  e[j - 1] = cs * e[j - 1];
                }
                if (wantv) {
                  for (let i = 0; i < n; i++) {
                    t = cs * V.get(i, j) + sn * V.get(i, p - 1);
                    V.set(i, p - 1, -sn * V.get(i, j) + cs * V.get(i, p - 1));
                    V.set(i, j, t);
                  }
                }
              }
              break;
            }
            case 2: {
              let f = e[k - 1];
              e[k - 1] = 0;
              for (let j = k; j < p; j++) {
                let t = hypotenuse(s[j], f);
                let cs = s[j] / t;
                let sn = f / t;
                s[j] = t;
                f = -sn * e[j];
                e[j] = cs * e[j];
                if (wantu) {
                  for (let i = 0; i < m; i++) {
                    t = cs * U.get(i, j) + sn * U.get(i, k - 1);
                    U.set(i, k - 1, -sn * U.get(i, j) + cs * U.get(i, k - 1));
                    U.set(i, j, t);
                  }
                }
              }
              break;
            }
            case 3: {
              const scale = Math.max(
                Math.abs(s[p - 1]),
                Math.abs(s[p - 2]),
                Math.abs(e[p - 2]),
                Math.abs(s[k]),
                Math.abs(e[k])
              );
              const sp = s[p - 1] / scale;
              const spm1 = s[p - 2] / scale;
              const epm1 = e[p - 2] / scale;
              const sk = s[k] / scale;
              const ek = e[k] / scale;
              const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
              const c = sp * epm1 * (sp * epm1);
              let shift = 0;
              if (b !== 0 || c !== 0) {
                if (b < 0) {
                  shift = 0 - Math.sqrt(b * b + c);
                } else {
                  shift = Math.sqrt(b * b + c);
                }
                shift = c / (b + shift);
              }
              let f = (sk + sp) * (sk - sp) + shift;
              let g = sk * ek;
              for (let j = k; j < p - 1; j++) {
                let t = hypotenuse(f, g);
                if (t === 0)
                  t = Number.MIN_VALUE;
                let cs = f / t;
                let sn = g / t;
                if (j !== k) {
                  e[j - 1] = t;
                }
                f = cs * s[j] + sn * e[j];
                e[j] = cs * e[j] - sn * s[j];
                g = sn * s[j + 1];
                s[j + 1] = cs * s[j + 1];
                if (wantv) {
                  for (let i = 0; i < n; i++) {
                    t = cs * V.get(i, j) + sn * V.get(i, j + 1);
                    V.set(i, j + 1, -sn * V.get(i, j) + cs * V.get(i, j + 1));
                    V.set(i, j, t);
                  }
                }
                t = hypotenuse(f, g);
                if (t === 0)
                  t = Number.MIN_VALUE;
                cs = f / t;
                sn = g / t;
                s[j] = t;
                f = cs * e[j] + sn * s[j + 1];
                s[j + 1] = -sn * e[j] + cs * s[j + 1];
                g = sn * e[j + 1];
                e[j + 1] = cs * e[j + 1];
                if (wantu && j < m - 1) {
                  for (let i = 0; i < m; i++) {
                    t = cs * U.get(i, j) + sn * U.get(i, j + 1);
                    U.set(i, j + 1, -sn * U.get(i, j) + cs * U.get(i, j + 1));
                    U.set(i, j, t);
                  }
                }
              }
              e[p - 2] = f;
              break;
            }
            case 4: {
              if (s[k] <= 0) {
                s[k] = s[k] < 0 ? -s[k] : 0;
                if (wantv) {
                  for (let i = 0; i <= pp; i++) {
                    V.set(i, k, -V.get(i, k));
                  }
                }
              }
              while (k < pp) {
                if (s[k] >= s[k + 1]) {
                  break;
                }
                let t = s[k];
                s[k] = s[k + 1];
                s[k + 1] = t;
                if (wantv && k < n - 1) {
                  for (let i = 0; i < n; i++) {
                    t = V.get(i, k + 1);
                    V.set(i, k + 1, V.get(i, k));
                    V.set(i, k, t);
                  }
                }
                if (wantu && k < m - 1) {
                  for (let i = 0; i < m; i++) {
                    t = U.get(i, k + 1);
                    U.set(i, k + 1, U.get(i, k));
                    U.set(i, k, t);
                  }
                }
                k++;
              }
              p--;
              break;
            }
          }
        }
        if (swapped) {
          let tmp = V;
          V = U;
          U = tmp;
        }
        this.m = m;
        this.n = n;
        this.s = s;
        this.U = U;
        this.V = V;
      }
      solve(value) {
        let Y = value;
        let e = this.threshold;
        let scols = this.s.length;
        let Ls = Matrix.zeros(scols, scols);
        for (let i = 0; i < scols; i++) {
          if (Math.abs(this.s[i]) <= e) {
            Ls.set(i, i, 0);
          } else {
            Ls.set(i, i, 1 / this.s[i]);
          }
        }
        let U = this.U;
        let V = this.rightSingularVectors;
        let VL = V.mmul(Ls);
        let vrows = V.rows;
        let urows = U.rows;
        let VLU = Matrix.zeros(vrows, urows);
        for (let i = 0; i < vrows; i++) {
          for (let j = 0; j < urows; j++) {
            let sum = 0;
            for (let k = 0; k < scols; k++) {
              sum += VL.get(i, k) * U.get(j, k);
            }
            VLU.set(i, j, sum);
          }
        }
        return VLU.mmul(Y);
      }
      solveForDiagonal(value) {
        return this.solve(Matrix.diag(value));
      }
      inverse() {
        let V = this.V;
        let e = this.threshold;
        let vrows = V.rows;
        let vcols = V.columns;
        let X = new Matrix(vrows, this.s.length);
        for (let i = 0; i < vrows; i++) {
          for (let j = 0; j < vcols; j++) {
            if (Math.abs(this.s[j]) > e) {
              X.set(i, j, V.get(i, j) / this.s[j]);
            }
          }
        }
        let U = this.U;
        let urows = U.rows;
        let ucols = U.columns;
        let Y = new Matrix(vrows, urows);
        for (let i = 0; i < vrows; i++) {
          for (let j = 0; j < urows; j++) {
            let sum = 0;
            for (let k = 0; k < ucols; k++) {
              sum += X.get(i, k) * U.get(j, k);
            }
            Y.set(i, j, sum);
          }
        }
        return Y;
      }
      get condition() {
        return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
      }
      get norm2() {
        return this.s[0];
      }
      get rank() {
        let tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
        let r = 0;
        let s = this.s;
        for (let i = 0, ii = s.length; i < ii; i++) {
          if (s[i] > tol) {
            r++;
          }
        }
        return r;
      }
      get diagonal() {
        return Array.from(this.s);
      }
      get threshold() {
        return Number.EPSILON / 2 * Math.max(this.m, this.n) * this.s[0];
      }
      get leftSingularVectors() {
        return this.U;
      }
      get rightSingularVectors() {
        return this.V;
      }
      get diagonalMatrix() {
        return Matrix.diag(this.s);
      }
    };
    function inverse(matrix, useSVD = false) {
      matrix = WrapperMatrix2D.checkMatrix(matrix);
      if (useSVD) {
        return new SingularValueDecomposition(matrix).inverse();
      } else {
        return solve(matrix, Matrix.eye(matrix.rows));
      }
    }
    function solve(leftHandSide, rightHandSide, useSVD = false) {
      leftHandSide = WrapperMatrix2D.checkMatrix(leftHandSide);
      rightHandSide = WrapperMatrix2D.checkMatrix(rightHandSide);
      if (useSVD) {
        return new SingularValueDecomposition(leftHandSide).solve(rightHandSide);
      } else {
        return leftHandSide.isSquare() ? new LuDecomposition(leftHandSide).solve(rightHandSide) : new QrDecomposition(leftHandSide).solve(rightHandSide);
      }
    }
    function determinant(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (matrix.isSquare()) {
        if (matrix.columns === 0) {
          return 1;
        }
        let a, b, c, d;
        if (matrix.columns === 2) {
          a = matrix.get(0, 0);
          b = matrix.get(0, 1);
          c = matrix.get(1, 0);
          d = matrix.get(1, 1);
          return a * d - b * c;
        } else if (matrix.columns === 3) {
          let subMatrix0, subMatrix1, subMatrix2;
          subMatrix0 = new MatrixSelectionView(matrix, [1, 2], [1, 2]);
          subMatrix1 = new MatrixSelectionView(matrix, [1, 2], [0, 2]);
          subMatrix2 = new MatrixSelectionView(matrix, [1, 2], [0, 1]);
          a = matrix.get(0, 0);
          b = matrix.get(0, 1);
          c = matrix.get(0, 2);
          return a * determinant(subMatrix0) - b * determinant(subMatrix1) + c * determinant(subMatrix2);
        } else {
          return new LuDecomposition(matrix).determinant;
        }
      } else {
        throw Error("determinant can only be calculated for a square matrix");
      }
    }
    function xrange(n, exception) {
      let range = [];
      for (let i = 0; i < n; i++) {
        if (i !== exception) {
          range.push(i);
        }
      }
      return range;
    }
    function dependenciesOneRow(error, matrix, index, thresholdValue = 1e-9, thresholdError = 1e-9) {
      if (error > thresholdError) {
        return new Array(matrix.rows + 1).fill(0);
      } else {
        let returnArray = matrix.addRow(index, [0]);
        for (let i = 0; i < returnArray.rows; i++) {
          if (Math.abs(returnArray.get(i, 0)) < thresholdValue) {
            returnArray.set(i, 0, 0);
          }
        }
        return returnArray.to1DArray();
      }
    }
    function linearDependencies(matrix, options = {}) {
      const { thresholdValue = 1e-9, thresholdError = 1e-9 } = options;
      matrix = Matrix.checkMatrix(matrix);
      let n = matrix.rows;
      let results = new Matrix(n, n);
      for (let i = 0; i < n; i++) {
        let b = Matrix.columnVector(matrix.getRow(i));
        let Abis = matrix.subMatrixRow(xrange(n, i)).transpose();
        let svd = new SingularValueDecomposition(Abis);
        let x = svd.solve(b);
        let error = Matrix.sub(b, Abis.mmul(x)).abs().max();
        results.setRow(
          i,
          dependenciesOneRow(error, x, i, thresholdValue, thresholdError)
        );
      }
      return results;
    }
    function pseudoInverse(matrix, threshold = Number.EPSILON) {
      matrix = Matrix.checkMatrix(matrix);
      if (matrix.isEmpty()) {
        return matrix.transpose();
      }
      let svdSolution = new SingularValueDecomposition(matrix, { autoTranspose: true });
      let U = svdSolution.leftSingularVectors;
      let V = svdSolution.rightSingularVectors;
      let s = svdSolution.diagonal;
      for (let i = 0; i < s.length; i++) {
        if (Math.abs(s[i]) > threshold) {
          s[i] = 1 / s[i];
        } else {
          s[i] = 0;
        }
      }
      return V.mmul(Matrix.diag(s).mmul(U.transpose()));
    }
    function covariance(xMatrix, yMatrix = xMatrix, options = {}) {
      xMatrix = new Matrix(xMatrix);
      let yIsSame = false;
      if (typeof yMatrix === "object" && !Matrix.isMatrix(yMatrix) && !isAnyArray.isAnyArray(yMatrix)) {
        options = yMatrix;
        yMatrix = xMatrix;
        yIsSame = true;
      } else {
        yMatrix = new Matrix(yMatrix);
      }
      if (xMatrix.rows !== yMatrix.rows) {
        throw new TypeError("Both matrices must have the same number of rows");
      }
      const { center = true } = options;
      if (center) {
        xMatrix = xMatrix.center("column");
        if (!yIsSame) {
          yMatrix = yMatrix.center("column");
        }
      }
      const cov = xMatrix.transpose().mmul(yMatrix);
      for (let i = 0; i < cov.rows; i++) {
        for (let j = 0; j < cov.columns; j++) {
          cov.set(i, j, cov.get(i, j) * (1 / (xMatrix.rows - 1)));
        }
      }
      return cov;
    }
    function correlation(xMatrix, yMatrix = xMatrix, options = {}) {
      xMatrix = new Matrix(xMatrix);
      let yIsSame = false;
      if (typeof yMatrix === "object" && !Matrix.isMatrix(yMatrix) && !isAnyArray.isAnyArray(yMatrix)) {
        options = yMatrix;
        yMatrix = xMatrix;
        yIsSame = true;
      } else {
        yMatrix = new Matrix(yMatrix);
      }
      if (xMatrix.rows !== yMatrix.rows) {
        throw new TypeError("Both matrices must have the same number of rows");
      }
      const { center = true, scale = true } = options;
      if (center) {
        xMatrix.center("column");
        if (!yIsSame) {
          yMatrix.center("column");
        }
      }
      if (scale) {
        xMatrix.scale("column");
        if (!yIsSame) {
          yMatrix.scale("column");
        }
      }
      const sdx = xMatrix.standardDeviation("column", { unbiased: true });
      const sdy = yIsSame ? sdx : yMatrix.standardDeviation("column", { unbiased: true });
      const corr = xMatrix.transpose().mmul(yMatrix);
      for (let i = 0; i < corr.rows; i++) {
        for (let j = 0; j < corr.columns; j++) {
          corr.set(
            i,
            j,
            corr.get(i, j) * (1 / (sdx[i] * sdy[j])) * (1 / (xMatrix.rows - 1))
          );
        }
      }
      return corr;
    }
    var EigenvalueDecomposition = class {
      constructor(matrix, options = {}) {
        const { assumeSymmetric = false } = options;
        matrix = WrapperMatrix2D.checkMatrix(matrix);
        if (!matrix.isSquare()) {
          throw new Error("Matrix is not a square matrix");
        }
        if (matrix.isEmpty()) {
          throw new Error("Matrix must be non-empty");
        }
        let n = matrix.columns;
        let V = new Matrix(n, n);
        let d = new Float64Array(n);
        let e = new Float64Array(n);
        let value = matrix;
        let i, j;
        let isSymmetric = false;
        if (assumeSymmetric) {
          isSymmetric = true;
        } else {
          isSymmetric = matrix.isSymmetric();
        }
        if (isSymmetric) {
          for (i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
              V.set(i, j, value.get(i, j));
            }
          }
          tred2(n, e, d, V);
          tql2(n, e, d, V);
        } else {
          let H = new Matrix(n, n);
          let ort = new Float64Array(n);
          for (j = 0; j < n; j++) {
            for (i = 0; i < n; i++) {
              H.set(i, j, value.get(i, j));
            }
          }
          orthes(n, H, ort, V);
          hqr2(n, e, d, V, H);
        }
        this.n = n;
        this.e = e;
        this.d = d;
        this.V = V;
      }
      get realEigenvalues() {
        return Array.from(this.d);
      }
      get imaginaryEigenvalues() {
        return Array.from(this.e);
      }
      get eigenvectorMatrix() {
        return this.V;
      }
      get diagonalMatrix() {
        let n = this.n;
        let e = this.e;
        let d = this.d;
        let X = new Matrix(n, n);
        let i, j;
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            X.set(i, j, 0);
          }
          X.set(i, i, d[i]);
          if (e[i] > 0) {
            X.set(i, i + 1, e[i]);
          } else if (e[i] < 0) {
            X.set(i, i - 1, e[i]);
          }
        }
        return X;
      }
    };
    function tred2(n, e, d, V) {
      let f, g, h, i, j, k, hh, scale;
      for (j = 0; j < n; j++) {
        d[j] = V.get(n - 1, j);
      }
      for (i = n - 1; i > 0; i--) {
        scale = 0;
        h = 0;
        for (k = 0; k < i; k++) {
          scale = scale + Math.abs(d[k]);
        }
        if (scale === 0) {
          e[i] = d[i - 1];
          for (j = 0; j < i; j++) {
            d[j] = V.get(i - 1, j);
            V.set(i, j, 0);
            V.set(j, i, 0);
          }
        } else {
          for (k = 0; k < i; k++) {
            d[k] /= scale;
            h += d[k] * d[k];
          }
          f = d[i - 1];
          g = Math.sqrt(h);
          if (f > 0) {
            g = -g;
          }
          e[i] = scale * g;
          h = h - f * g;
          d[i - 1] = f - g;
          for (j = 0; j < i; j++) {
            e[j] = 0;
          }
          for (j = 0; j < i; j++) {
            f = d[j];
            V.set(j, i, f);
            g = e[j] + V.get(j, j) * f;
            for (k = j + 1; k <= i - 1; k++) {
              g += V.get(k, j) * d[k];
              e[k] += V.get(k, j) * f;
            }
            e[j] = g;
          }
          f = 0;
          for (j = 0; j < i; j++) {
            e[j] /= h;
            f += e[j] * d[j];
          }
          hh = f / (h + h);
          for (j = 0; j < i; j++) {
            e[j] -= hh * d[j];
          }
          for (j = 0; j < i; j++) {
            f = d[j];
            g = e[j];
            for (k = j; k <= i - 1; k++) {
              V.set(k, j, V.get(k, j) - (f * e[k] + g * d[k]));
            }
            d[j] = V.get(i - 1, j);
            V.set(i, j, 0);
          }
        }
        d[i] = h;
      }
      for (i = 0; i < n - 1; i++) {
        V.set(n - 1, i, V.get(i, i));
        V.set(i, i, 1);
        h = d[i + 1];
        if (h !== 0) {
          for (k = 0; k <= i; k++) {
            d[k] = V.get(k, i + 1) / h;
          }
          for (j = 0; j <= i; j++) {
            g = 0;
            for (k = 0; k <= i; k++) {
              g += V.get(k, i + 1) * V.get(k, j);
            }
            for (k = 0; k <= i; k++) {
              V.set(k, j, V.get(k, j) - g * d[k]);
            }
          }
        }
        for (k = 0; k <= i; k++) {
          V.set(k, i + 1, 0);
        }
      }
      for (j = 0; j < n; j++) {
        d[j] = V.get(n - 1, j);
        V.set(n - 1, j, 0);
      }
      V.set(n - 1, n - 1, 1);
      e[0] = 0;
    }
    function tql2(n, e, d, V) {
      let g, h, i, j, k, l, m, p, r, dl1, c, c2, c3, el1, s, s2;
      for (i = 1; i < n; i++) {
        e[i - 1] = e[i];
      }
      e[n - 1] = 0;
      let f = 0;
      let tst1 = 0;
      let eps = Number.EPSILON;
      for (l = 0; l < n; l++) {
        tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
        m = l;
        while (m < n) {
          if (Math.abs(e[m]) <= eps * tst1) {
            break;
          }
          m++;
        }
        if (m > l) {
          do {
            g = d[l];
            p = (d[l + 1] - g) / (2 * e[l]);
            r = hypotenuse(p, 1);
            if (p < 0) {
              r = -r;
            }
            d[l] = e[l] / (p + r);
            d[l + 1] = e[l] * (p + r);
            dl1 = d[l + 1];
            h = g - d[l];
            for (i = l + 2; i < n; i++) {
              d[i] -= h;
            }
            f = f + h;
            p = d[m];
            c = 1;
            c2 = c;
            c3 = c;
            el1 = e[l + 1];
            s = 0;
            s2 = 0;
            for (i = m - 1; i >= l; i--) {
              c3 = c2;
              c2 = c;
              s2 = s;
              g = c * e[i];
              h = c * p;
              r = hypotenuse(p, e[i]);
              e[i + 1] = s * r;
              s = e[i] / r;
              c = p / r;
              p = c * d[i] - s * g;
              d[i + 1] = h + s * (c * g + s * d[i]);
              for (k = 0; k < n; k++) {
                h = V.get(k, i + 1);
                V.set(k, i + 1, s * V.get(k, i) + c * h);
                V.set(k, i, c * V.get(k, i) - s * h);
              }
            }
            p = -s * s2 * c3 * el1 * e[l] / dl1;
            e[l] = s * p;
            d[l] = c * p;
          } while (Math.abs(e[l]) > eps * tst1);
        }
        d[l] = d[l] + f;
        e[l] = 0;
      }
      for (i = 0; i < n - 1; i++) {
        k = i;
        p = d[i];
        for (j = i + 1; j < n; j++) {
          if (d[j] < p) {
            k = j;
            p = d[j];
          }
        }
        if (k !== i) {
          d[k] = d[i];
          d[i] = p;
          for (j = 0; j < n; j++) {
            p = V.get(j, i);
            V.set(j, i, V.get(j, k));
            V.set(j, k, p);
          }
        }
      }
    }
    function orthes(n, H, ort, V) {
      let low = 0;
      let high = n - 1;
      let f, g, h, i, j, m;
      let scale;
      for (m = low + 1; m <= high - 1; m++) {
        scale = 0;
        for (i = m; i <= high; i++) {
          scale = scale + Math.abs(H.get(i, m - 1));
        }
        if (scale !== 0) {
          h = 0;
          for (i = high; i >= m; i--) {
            ort[i] = H.get(i, m - 1) / scale;
            h += ort[i] * ort[i];
          }
          g = Math.sqrt(h);
          if (ort[m] > 0) {
            g = -g;
          }
          h = h - ort[m] * g;
          ort[m] = ort[m] - g;
          for (j = m; j < n; j++) {
            f = 0;
            for (i = high; i >= m; i--) {
              f += ort[i] * H.get(i, j);
            }
            f = f / h;
            for (i = m; i <= high; i++) {
              H.set(i, j, H.get(i, j) - f * ort[i]);
            }
          }
          for (i = 0; i <= high; i++) {
            f = 0;
            for (j = high; j >= m; j--) {
              f += ort[j] * H.get(i, j);
            }
            f = f / h;
            for (j = m; j <= high; j++) {
              H.set(i, j, H.get(i, j) - f * ort[j]);
            }
          }
          ort[m] = scale * ort[m];
          H.set(m, m - 1, scale * g);
        }
      }
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          V.set(i, j, i === j ? 1 : 0);
        }
      }
      for (m = high - 1; m >= low + 1; m--) {
        if (H.get(m, m - 1) !== 0) {
          for (i = m + 1; i <= high; i++) {
            ort[i] = H.get(i, m - 1);
          }
          for (j = m; j <= high; j++) {
            g = 0;
            for (i = m; i <= high; i++) {
              g += ort[i] * V.get(i, j);
            }
            g = g / ort[m] / H.get(m, m - 1);
            for (i = m; i <= high; i++) {
              V.set(i, j, V.get(i, j) + g * ort[i]);
            }
          }
        }
      }
    }
    function hqr2(nn, e, d, V, H) {
      let n = nn - 1;
      let low = 0;
      let high = nn - 1;
      let eps = Number.EPSILON;
      let exshift = 0;
      let norm = 0;
      let p = 0;
      let q = 0;
      let r = 0;
      let s = 0;
      let z = 0;
      let iter = 0;
      let i, j, k, l, m, t, w, x, y;
      let ra, sa, vr, vi;
      let notlast, cdivres;
      for (i = 0; i < nn; i++) {
        if (i < low || i > high) {
          d[i] = H.get(i, i);
          e[i] = 0;
        }
        for (j = Math.max(i - 1, 0); j < nn; j++) {
          norm = norm + Math.abs(H.get(i, j));
        }
      }
      while (n >= low) {
        l = n;
        while (l > low) {
          s = Math.abs(H.get(l - 1, l - 1)) + Math.abs(H.get(l, l));
          if (s === 0) {
            s = norm;
          }
          if (Math.abs(H.get(l, l - 1)) < eps * s) {
            break;
          }
          l--;
        }
        if (l === n) {
          H.set(n, n, H.get(n, n) + exshift);
          d[n] = H.get(n, n);
          e[n] = 0;
          n--;
          iter = 0;
        } else if (l === n - 1) {
          w = H.get(n, n - 1) * H.get(n - 1, n);
          p = (H.get(n - 1, n - 1) - H.get(n, n)) / 2;
          q = p * p + w;
          z = Math.sqrt(Math.abs(q));
          H.set(n, n, H.get(n, n) + exshift);
          H.set(n - 1, n - 1, H.get(n - 1, n - 1) + exshift);
          x = H.get(n, n);
          if (q >= 0) {
            z = p >= 0 ? p + z : p - z;
            d[n - 1] = x + z;
            d[n] = d[n - 1];
            if (z !== 0) {
              d[n] = x - w / z;
            }
            e[n - 1] = 0;
            e[n] = 0;
            x = H.get(n, n - 1);
            s = Math.abs(x) + Math.abs(z);
            p = x / s;
            q = z / s;
            r = Math.sqrt(p * p + q * q);
            p = p / r;
            q = q / r;
            for (j = n - 1; j < nn; j++) {
              z = H.get(n - 1, j);
              H.set(n - 1, j, q * z + p * H.get(n, j));
              H.set(n, j, q * H.get(n, j) - p * z);
            }
            for (i = 0; i <= n; i++) {
              z = H.get(i, n - 1);
              H.set(i, n - 1, q * z + p * H.get(i, n));
              H.set(i, n, q * H.get(i, n) - p * z);
            }
            for (i = low; i <= high; i++) {
              z = V.get(i, n - 1);
              V.set(i, n - 1, q * z + p * V.get(i, n));
              V.set(i, n, q * V.get(i, n) - p * z);
            }
          } else {
            d[n - 1] = x + p;
            d[n] = x + p;
            e[n - 1] = z;
            e[n] = -z;
          }
          n = n - 2;
          iter = 0;
        } else {
          x = H.get(n, n);
          y = 0;
          w = 0;
          if (l < n) {
            y = H.get(n - 1, n - 1);
            w = H.get(n, n - 1) * H.get(n - 1, n);
          }
          if (iter === 10) {
            exshift += x;
            for (i = low; i <= n; i++) {
              H.set(i, i, H.get(i, i) - x);
            }
            s = Math.abs(H.get(n, n - 1)) + Math.abs(H.get(n - 1, n - 2));
            x = y = 0.75 * s;
            w = -0.4375 * s * s;
          }
          if (iter === 30) {
            s = (y - x) / 2;
            s = s * s + w;
            if (s > 0) {
              s = Math.sqrt(s);
              if (y < x) {
                s = -s;
              }
              s = x - w / ((y - x) / 2 + s);
              for (i = low; i <= n; i++) {
                H.set(i, i, H.get(i, i) - s);
              }
              exshift += s;
              x = y = w = 0.964;
            }
          }
          iter = iter + 1;
          m = n - 2;
          while (m >= l) {
            z = H.get(m, m);
            r = x - z;
            s = y - z;
            p = (r * s - w) / H.get(m + 1, m) + H.get(m, m + 1);
            q = H.get(m + 1, m + 1) - z - r - s;
            r = H.get(m + 2, m + 1);
            s = Math.abs(p) + Math.abs(q) + Math.abs(r);
            p = p / s;
            q = q / s;
            r = r / s;
            if (m === l) {
              break;
            }
            if (Math.abs(H.get(m, m - 1)) * (Math.abs(q) + Math.abs(r)) < eps * (Math.abs(p) * (Math.abs(H.get(m - 1, m - 1)) + Math.abs(z) + Math.abs(H.get(m + 1, m + 1))))) {
              break;
            }
            m--;
          }
          for (i = m + 2; i <= n; i++) {
            H.set(i, i - 2, 0);
            if (i > m + 2) {
              H.set(i, i - 3, 0);
            }
          }
          for (k = m; k <= n - 1; k++) {
            notlast = k !== n - 1;
            if (k !== m) {
              p = H.get(k, k - 1);
              q = H.get(k + 1, k - 1);
              r = notlast ? H.get(k + 2, k - 1) : 0;
              x = Math.abs(p) + Math.abs(q) + Math.abs(r);
              if (x !== 0) {
                p = p / x;
                q = q / x;
                r = r / x;
              }
            }
            if (x === 0) {
              break;
            }
            s = Math.sqrt(p * p + q * q + r * r);
            if (p < 0) {
              s = -s;
            }
            if (s !== 0) {
              if (k !== m) {
                H.set(k, k - 1, -s * x);
              } else if (l !== m) {
                H.set(k, k - 1, -H.get(k, k - 1));
              }
              p = p + s;
              x = p / s;
              y = q / s;
              z = r / s;
              q = q / p;
              r = r / p;
              for (j = k; j < nn; j++) {
                p = H.get(k, j) + q * H.get(k + 1, j);
                if (notlast) {
                  p = p + r * H.get(k + 2, j);
                  H.set(k + 2, j, H.get(k + 2, j) - p * z);
                }
                H.set(k, j, H.get(k, j) - p * x);
                H.set(k + 1, j, H.get(k + 1, j) - p * y);
              }
              for (i = 0; i <= Math.min(n, k + 3); i++) {
                p = x * H.get(i, k) + y * H.get(i, k + 1);
                if (notlast) {
                  p = p + z * H.get(i, k + 2);
                  H.set(i, k + 2, H.get(i, k + 2) - p * r);
                }
                H.set(i, k, H.get(i, k) - p);
                H.set(i, k + 1, H.get(i, k + 1) - p * q);
              }
              for (i = low; i <= high; i++) {
                p = x * V.get(i, k) + y * V.get(i, k + 1);
                if (notlast) {
                  p = p + z * V.get(i, k + 2);
                  V.set(i, k + 2, V.get(i, k + 2) - p * r);
                }
                V.set(i, k, V.get(i, k) - p);
                V.set(i, k + 1, V.get(i, k + 1) - p * q);
              }
            }
          }
        }
      }
      if (norm === 0) {
        return;
      }
      for (n = nn - 1; n >= 0; n--) {
        p = d[n];
        q = e[n];
        if (q === 0) {
          l = n;
          H.set(n, n, 1);
          for (i = n - 1; i >= 0; i--) {
            w = H.get(i, i) - p;
            r = 0;
            for (j = l; j <= n; j++) {
              r = r + H.get(i, j) * H.get(j, n);
            }
            if (e[i] < 0) {
              z = w;
              s = r;
            } else {
              l = i;
              if (e[i] === 0) {
                H.set(i, n, w !== 0 ? -r / w : -r / (eps * norm));
              } else {
                x = H.get(i, i + 1);
                y = H.get(i + 1, i);
                q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
                t = (x * s - z * r) / q;
                H.set(i, n, t);
                H.set(
                  i + 1,
                  n,
                  Math.abs(x) > Math.abs(z) ? (-r - w * t) / x : (-s - y * t) / z
                );
              }
              t = Math.abs(H.get(i, n));
              if (eps * t * t > 1) {
                for (j = i; j <= n; j++) {
                  H.set(j, n, H.get(j, n) / t);
                }
              }
            }
          }
        } else if (q < 0) {
          l = n - 1;
          if (Math.abs(H.get(n, n - 1)) > Math.abs(H.get(n - 1, n))) {
            H.set(n - 1, n - 1, q / H.get(n, n - 1));
            H.set(n - 1, n, -(H.get(n, n) - p) / H.get(n, n - 1));
          } else {
            cdivres = cdiv(0, -H.get(n - 1, n), H.get(n - 1, n - 1) - p, q);
            H.set(n - 1, n - 1, cdivres[0]);
            H.set(n - 1, n, cdivres[1]);
          }
          H.set(n, n - 1, 0);
          H.set(n, n, 1);
          for (i = n - 2; i >= 0; i--) {
            ra = 0;
            sa = 0;
            for (j = l; j <= n; j++) {
              ra = ra + H.get(i, j) * H.get(j, n - 1);
              sa = sa + H.get(i, j) * H.get(j, n);
            }
            w = H.get(i, i) - p;
            if (e[i] < 0) {
              z = w;
              r = ra;
              s = sa;
            } else {
              l = i;
              if (e[i] === 0) {
                cdivres = cdiv(-ra, -sa, w, q);
                H.set(i, n - 1, cdivres[0]);
                H.set(i, n, cdivres[1]);
              } else {
                x = H.get(i, i + 1);
                y = H.get(i + 1, i);
                vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
                vi = (d[i] - p) * 2 * q;
                if (vr === 0 && vi === 0) {
                  vr = eps * norm * (Math.abs(w) + Math.abs(q) + Math.abs(x) + Math.abs(y) + Math.abs(z));
                }
                cdivres = cdiv(
                  x * r - z * ra + q * sa,
                  x * s - z * sa - q * ra,
                  vr,
                  vi
                );
                H.set(i, n - 1, cdivres[0]);
                H.set(i, n, cdivres[1]);
                if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
                  H.set(
                    i + 1,
                    n - 1,
                    (-ra - w * H.get(i, n - 1) + q * H.get(i, n)) / x
                  );
                  H.set(
                    i + 1,
                    n,
                    (-sa - w * H.get(i, n) - q * H.get(i, n - 1)) / x
                  );
                } else {
                  cdivres = cdiv(
                    -r - y * H.get(i, n - 1),
                    -s - y * H.get(i, n),
                    z,
                    q
                  );
                  H.set(i + 1, n - 1, cdivres[0]);
                  H.set(i + 1, n, cdivres[1]);
                }
              }
              t = Math.max(Math.abs(H.get(i, n - 1)), Math.abs(H.get(i, n)));
              if (eps * t * t > 1) {
                for (j = i; j <= n; j++) {
                  H.set(j, n - 1, H.get(j, n - 1) / t);
                  H.set(j, n, H.get(j, n) / t);
                }
              }
            }
          }
        }
      }
      for (i = 0; i < nn; i++) {
        if (i < low || i > high) {
          for (j = i; j < nn; j++) {
            V.set(i, j, H.get(i, j));
          }
        }
      }
      for (j = nn - 1; j >= low; j--) {
        for (i = low; i <= high; i++) {
          z = 0;
          for (k = low; k <= Math.min(j, high); k++) {
            z = z + V.get(i, k) * H.get(k, j);
          }
          V.set(i, j, z);
        }
      }
    }
    function cdiv(xr, xi, yr, yi) {
      let r, d;
      if (Math.abs(yr) > Math.abs(yi)) {
        r = yi / yr;
        d = yr + r * yi;
        return [(xr + r * xi) / d, (xi - r * xr) / d];
      } else {
        r = yr / yi;
        d = yi + r * yr;
        return [(r * xr + xi) / d, (r * xi - xr) / d];
      }
    }
    var CholeskyDecomposition = class {
      constructor(value) {
        value = WrapperMatrix2D.checkMatrix(value);
        if (!value.isSymmetric()) {
          throw new Error("Matrix is not symmetric");
        }
        let a = value;
        let dimension = a.rows;
        let l = new Matrix(dimension, dimension);
        let positiveDefinite = true;
        let i, j, k;
        for (j = 0; j < dimension; j++) {
          let d = 0;
          for (k = 0; k < j; k++) {
            let s = 0;
            for (i = 0; i < k; i++) {
              s += l.get(k, i) * l.get(j, i);
            }
            s = (a.get(j, k) - s) / l.get(k, k);
            l.set(j, k, s);
            d = d + s * s;
          }
          d = a.get(j, j) - d;
          positiveDefinite && (positiveDefinite = d > 0);
          l.set(j, j, Math.sqrt(Math.max(d, 0)));
          for (k = j + 1; k < dimension; k++) {
            l.set(j, k, 0);
          }
        }
        this.L = l;
        this.positiveDefinite = positiveDefinite;
      }
      isPositiveDefinite() {
        return this.positiveDefinite;
      }
      solve(value) {
        value = WrapperMatrix2D.checkMatrix(value);
        let l = this.L;
        let dimension = l.rows;
        if (value.rows !== dimension) {
          throw new Error("Matrix dimensions do not match");
        }
        if (this.isPositiveDefinite() === false) {
          throw new Error("Matrix is not positive definite");
        }
        let count = value.columns;
        let B = value.clone();
        let i, j, k;
        for (k = 0; k < dimension; k++) {
          for (j = 0; j < count; j++) {
            for (i = 0; i < k; i++) {
              B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(k, i));
            }
            B.set(k, j, B.get(k, j) / l.get(k, k));
          }
        }
        for (k = dimension - 1; k >= 0; k--) {
          for (j = 0; j < count; j++) {
            for (i = k + 1; i < dimension; i++) {
              B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(i, k));
            }
            B.set(k, j, B.get(k, j) / l.get(k, k));
          }
        }
        return B;
      }
      get lowerTriangularMatrix() {
        return this.L;
      }
    };
    var nipals = class {
      constructor(X, options = {}) {
        X = WrapperMatrix2D.checkMatrix(X);
        let { Y } = options;
        const {
          scaleScores = false,
          maxIterations = 1e3,
          terminationCriteria = 1e-10
        } = options;
        let u;
        if (Y) {
          if (isAnyArray.isAnyArray(Y) && typeof Y[0] === "number") {
            Y = Matrix.columnVector(Y);
          } else {
            Y = WrapperMatrix2D.checkMatrix(Y);
          }
          if (Y.rows !== X.rows) {
            throw new Error("Y should have the same number of rows as X");
          }
          u = Y.getColumnVector(0);
        } else {
          u = X.getColumnVector(0);
        }
        let diff = 1;
        let t, q, w, tOld;
        for (let counter = 0; counter < maxIterations && diff > terminationCriteria; counter++) {
          w = X.transpose().mmul(u).div(u.transpose().mmul(u).get(0, 0));
          w = w.div(w.norm());
          t = X.mmul(w).div(w.transpose().mmul(w).get(0, 0));
          if (counter > 0) {
            diff = t.clone().sub(tOld).pow(2).sum();
          }
          tOld = t.clone();
          if (Y) {
            q = Y.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
            q = q.div(q.norm());
            u = Y.mmul(q).div(q.transpose().mmul(q).get(0, 0));
          } else {
            u = t;
          }
        }
        if (Y) {
          let p = X.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
          p = p.div(p.norm());
          let xResidual = X.clone().sub(t.clone().mmul(p.transpose()));
          let residual = u.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
          let yResidual = Y.clone().sub(
            t.clone().mulS(residual.get(0, 0)).mmul(q.transpose())
          );
          this.t = t;
          this.p = p.transpose();
          this.w = w.transpose();
          this.q = q;
          this.u = u;
          this.s = t.transpose().mmul(t);
          this.xResidual = xResidual;
          this.yResidual = yResidual;
          this.betas = residual;
        } else {
          this.w = w.transpose();
          this.s = t.transpose().mmul(t).sqrt();
          if (scaleScores) {
            this.t = t.clone().div(this.s.get(0, 0));
          } else {
            this.t = t;
          }
          this.xResidual = X.sub(t.mmul(w.transpose()));
        }
      }
    };
    exports.AbstractMatrix = AbstractMatrix;
    exports.CHO = CholeskyDecomposition;
    exports.CholeskyDecomposition = CholeskyDecomposition;
    exports.DistanceMatrix = DistanceMatrix;
    exports.EVD = EigenvalueDecomposition;
    exports.EigenvalueDecomposition = EigenvalueDecomposition;
    exports.LU = LuDecomposition;
    exports.LuDecomposition = LuDecomposition;
    exports.Matrix = Matrix;
    exports.MatrixColumnSelectionView = MatrixColumnSelectionView;
    exports.MatrixColumnView = MatrixColumnView;
    exports.MatrixFlipColumnView = MatrixFlipColumnView;
    exports.MatrixFlipRowView = MatrixFlipRowView;
    exports.MatrixRowSelectionView = MatrixRowSelectionView;
    exports.MatrixRowView = MatrixRowView;
    exports.MatrixSelectionView = MatrixSelectionView;
    exports.MatrixSubView = MatrixSubView;
    exports.MatrixTransposeView = MatrixTransposeView;
    exports.NIPALS = nipals;
    exports.Nipals = nipals;
    exports.QR = QrDecomposition;
    exports.QrDecomposition = QrDecomposition;
    exports.SVD = SingularValueDecomposition;
    exports.SingularValueDecomposition = SingularValueDecomposition;
    exports.SymmetricMatrix = SymmetricMatrix;
    exports.WrapperMatrix1D = WrapperMatrix1D;
    exports.WrapperMatrix2D = WrapperMatrix2D;
    exports.correlation = correlation;
    exports.covariance = covariance;
    exports.default = Matrix;
    exports.determinant = determinant;
    exports.inverse = inverse;
    exports.linearDependencies = linearDependencies;
    exports.pseudoInverse = pseudoInverse;
    exports.solve = solve;
    exports.wrap = wrap;
  }
});

// node_modules/ml-levenberg-marquardt/lib/index.js
var require_lib9 = __commonJS({
  "node_modules/ml-levenberg-marquardt/lib/index.js"(exports, module2) {
    "use strict";
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var isArray = _interopDefault(require_lib());
    var mlMatrix = require_matrix2();
    function errorCalculation(data, parameters, parameterizedFunction) {
      let error = 0;
      const func = parameterizedFunction(parameters);
      for (let i = 0; i < data.x.length; i++) {
        error += Math.abs(data.y[i] - func(data.x[i]));
      }
      return error;
    }
    function gradientFunction(data, evaluatedData, params, gradientDifference, paramFunction) {
      const n = params.length;
      const m = data.x.length;
      let ans = new Array(n);
      for (let param = 0; param < n; param++) {
        ans[param] = new Array(m);
        let auxParams = params.slice();
        auxParams[param] += gradientDifference;
        let funcParam = paramFunction(auxParams);
        for (let point = 0; point < m; point++) {
          ans[param][point] = evaluatedData[point] - funcParam(data.x[point]);
        }
      }
      return new mlMatrix.Matrix(ans);
    }
    function matrixFunction(data, evaluatedData) {
      const m = data.x.length;
      let ans = new Array(m);
      for (let point = 0; point < m; point++) {
        ans[point] = [data.y[point] - evaluatedData[point]];
      }
      return new mlMatrix.Matrix(ans);
    }
    function step(data, params, damping, gradientDifference, parameterizedFunction) {
      let value = damping * gradientDifference * gradientDifference;
      let identity = mlMatrix.Matrix.eye(params.length, params.length, value);
      const func = parameterizedFunction(params);
      let evaluatedData = new Float64Array(data.x.length);
      for (let i = 0; i < data.x.length; i++) {
        evaluatedData[i] = func(data.x[i]);
      }
      let gradientFunc = gradientFunction(
        data,
        evaluatedData,
        params,
        gradientDifference,
        parameterizedFunction
      );
      let matrixFunc = matrixFunction(data, evaluatedData);
      let inverseMatrix = mlMatrix.inverse(
        identity.add(gradientFunc.mmul(gradientFunc.transpose()))
      );
      params = new mlMatrix.Matrix([params]);
      params = params.sub(
        inverseMatrix.mmul(gradientFunc).mmul(matrixFunc).mul(gradientDifference).transpose()
      );
      return params.to1DArray();
    }
    function levenbergMarquardt(data, parameterizedFunction, options = {}) {
      let {
        maxIterations = 100,
        gradientDifference = 0.1,
        damping = 0,
        errorTolerance = 0.01,
        minValues,
        maxValues,
        initialValues
      } = options;
      if (damping <= 0) {
        throw new Error("The damping option must be a positive number");
      } else if (!data.x || !data.y) {
        throw new Error("The data parameter must have x and y elements");
      } else if (!isArray(data.x) || data.x.length < 2 || !isArray(data.y) || data.y.length < 2) {
        throw new Error(
          "The data parameter elements must be an array with more than 2 points"
        );
      } else if (data.x.length !== data.y.length) {
        throw new Error("The data parameter elements must have the same size");
      }
      let parameters = initialValues || new Array(parameterizedFunction.length).fill(1);
      let parLen = parameters.length;
      maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
      minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);
      if (maxValues.length !== minValues.length) {
        throw new Error("minValues and maxValues must be the same size");
      }
      if (!isArray(parameters)) {
        throw new Error("initialValues must be an array");
      }
      let error = errorCalculation(data, parameters, parameterizedFunction);
      let converged = error <= errorTolerance;
      let iteration;
      for (iteration = 0; iteration < maxIterations && !converged; iteration++) {
        parameters = step(
          data,
          parameters,
          damping,
          gradientDifference,
          parameterizedFunction
        );
        for (let k = 0; k < parLen; k++) {
          parameters[k] = Math.min(
            Math.max(minValues[k], parameters[k]),
            maxValues[k]
          );
        }
        error = errorCalculation(data, parameters, parameterizedFunction);
        if (isNaN(error))
          break;
        converged = error <= errorTolerance;
      }
      return {
        parameterValues: parameters,
        parameterError: error,
        iterations: iteration
      };
    }
    module2.exports = levenbergMarquardt;
  }
});

// node_modules/umap-js/dist/umap.js
var require_umap = __commonJS({
  "node_modules/umap-js/dist/umap.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = exports && exports.__generator || function(thisArg, body) {
      var _ = { label: 0, sent: function() {
        if (t[0] & 1)
          throw t[1];
        return t[1];
      }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([n, v]);
        };
      }
      function step(op) {
        if (f)
          throw new TypeError("Generator is already executing.");
        while (_)
          try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
              return t;
            if (y = 0, t)
              op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return { value: op[1], done: false };
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2])
                  _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
        if (op[0] & 5)
          throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
      }
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m)
        return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"]))
            m.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    var __spread = exports && exports.__spread || function() {
      for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
      return ar;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initTransform = exports.resetLocalConnectivity = exports.fastIntersection = exports.findABParams = exports.cosine = exports.euclidean = exports.UMAP = void 0;
    var heap = __importStar(require_heap());
    var matrix = __importStar(require_matrix());
    var nnDescent = __importStar(require_nn_descent());
    var tree = __importStar(require_tree());
    var utils = __importStar(require_utils());
    var ml_levenberg_marquardt_1 = __importDefault(require_lib9());
    var SMOOTH_K_TOLERANCE = 1e-5;
    var MIN_K_DIST_SCALE = 1e-3;
    var UMAP2 = function() {
      function UMAP3(params) {
        var _this = this;
        if (params === void 0) {
          params = {};
        }
        this.learningRate = 1;
        this.localConnectivity = 1;
        this.minDist = 0.1;
        this.nComponents = 2;
        this.nEpochs = 0;
        this.nNeighbors = 15;
        this.negativeSampleRate = 5;
        this.random = Math.random;
        this.repulsionStrength = 1;
        this.setOpMixRatio = 1;
        this.spread = 1;
        this.transformQueueSize = 4;
        this.targetMetric = "categorical";
        this.targetWeight = 0.5;
        this.targetNNeighbors = this.nNeighbors;
        this.distanceFn = euclidean;
        this.isInitialized = false;
        this.rpForest = [];
        this.embedding = [];
        this.optimizationState = new OptimizationState();
        var setParam = function(key) {
          if (params[key] !== void 0)
            _this[key] = params[key];
        };
        setParam("distanceFn");
        setParam("learningRate");
        setParam("localConnectivity");
        setParam("minDist");
        setParam("nComponents");
        setParam("nEpochs");
        setParam("nNeighbors");
        setParam("negativeSampleRate");
        setParam("random");
        setParam("repulsionStrength");
        setParam("setOpMixRatio");
        setParam("spread");
        setParam("transformQueueSize");
      }
      UMAP3.prototype.fit = function(X) {
        this.initializeFit(X);
        this.optimizeLayout();
        return this.embedding;
      };
      UMAP3.prototype.fitAsync = function(X, callback) {
        if (callback === void 0) {
          callback = function() {
            return true;
          };
        }
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
              case 0:
                this.initializeFit(X);
                return [4, this.optimizeLayoutAsync(callback)];
              case 1:
                _a.sent();
                return [2, this.embedding];
            }
          });
        });
      };
      UMAP3.prototype.setSupervisedProjection = function(Y, params) {
        if (params === void 0) {
          params = {};
        }
        this.Y = Y;
        this.targetMetric = params.targetMetric || this.targetMetric;
        this.targetWeight = params.targetWeight || this.targetWeight;
        this.targetNNeighbors = params.targetNNeighbors || this.targetNNeighbors;
      };
      UMAP3.prototype.setPrecomputedKNN = function(knnIndices, knnDistances) {
        this.knnIndices = knnIndices;
        this.knnDistances = knnDistances;
      };
      UMAP3.prototype.initializeFit = function(X) {
        if (X.length <= this.nNeighbors) {
          throw new Error("Not enough data points (" + X.length + ") to create nNeighbors: " + this.nNeighbors + ".  Add more data points or adjust the configuration.");
        }
        if (this.X === X && this.isInitialized) {
          return this.getNEpochs();
        }
        this.X = X;
        if (!this.knnIndices && !this.knnDistances) {
          var knnResults = this.nearestNeighbors(X);
          this.knnIndices = knnResults.knnIndices;
          this.knnDistances = knnResults.knnDistances;
        }
        this.graph = this.fuzzySimplicialSet(X, this.nNeighbors, this.setOpMixRatio);
        this.makeSearchFns();
        this.searchGraph = this.makeSearchGraph(X);
        this.processGraphForSupervisedProjection();
        var _a = this.initializeSimplicialSetEmbedding(), head = _a.head, tail = _a.tail, epochsPerSample = _a.epochsPerSample;
        this.optimizationState.head = head;
        this.optimizationState.tail = tail;
        this.optimizationState.epochsPerSample = epochsPerSample;
        this.initializeOptimization();
        this.prepareForOptimizationLoop();
        this.isInitialized = true;
        return this.getNEpochs();
      };
      UMAP3.prototype.makeSearchFns = function() {
        var _a = nnDescent.makeInitializations(this.distanceFn), initFromTree = _a.initFromTree, initFromRandom = _a.initFromRandom;
        this.initFromTree = initFromTree;
        this.initFromRandom = initFromRandom;
        this.search = nnDescent.makeInitializedNNSearch(this.distanceFn);
      };
      UMAP3.prototype.makeSearchGraph = function(X) {
        var knnIndices = this.knnIndices;
        var knnDistances = this.knnDistances;
        var dims = [X.length, X.length];
        var searchGraph = new matrix.SparseMatrix([], [], [], dims);
        for (var i = 0; i < knnIndices.length; i++) {
          var knn = knnIndices[i];
          var distances = knnDistances[i];
          for (var j = 0; j < knn.length; j++) {
            var neighbor = knn[j];
            var distance = distances[j];
            if (distance > 0) {
              searchGraph.set(i, neighbor, distance);
            }
          }
        }
        var transpose = matrix.transpose(searchGraph);
        return matrix.maximum(searchGraph, transpose);
      };
      UMAP3.prototype.transform = function(toTransform) {
        var _this = this;
        var rawData = this.X;
        if (rawData === void 0 || rawData.length === 0) {
          throw new Error("No data has been fit.");
        }
        var nNeighbors = Math.floor(this.nNeighbors * this.transformQueueSize);
        nNeighbors = Math.min(rawData.length, nNeighbors);
        var init = nnDescent.initializeSearch(this.rpForest, rawData, toTransform, nNeighbors, this.initFromRandom, this.initFromTree, this.random);
        var result = this.search(rawData, this.searchGraph, init, toTransform);
        var _a = heap.deheapSort(result), indices = _a.indices, distances = _a.weights;
        indices = indices.map(function(x) {
          return x.slice(0, _this.nNeighbors);
        });
        distances = distances.map(function(x) {
          return x.slice(0, _this.nNeighbors);
        });
        var adjustedLocalConnectivity = Math.max(0, this.localConnectivity - 1);
        var _b = this.smoothKNNDistance(distances, this.nNeighbors, adjustedLocalConnectivity), sigmas = _b.sigmas, rhos = _b.rhos;
        var _c = this.computeMembershipStrengths(indices, distances, sigmas, rhos), rows = _c.rows, cols = _c.cols, vals = _c.vals;
        var size = [toTransform.length, rawData.length];
        var graph = new matrix.SparseMatrix(rows, cols, vals, size);
        var normed = matrix.normalize(graph, "l1");
        var csrMatrix = matrix.getCSR(normed);
        var nPoints = toTransform.length;
        var eIndices = utils.reshape2d(csrMatrix.indices, nPoints, this.nNeighbors);
        var eWeights = utils.reshape2d(csrMatrix.values, nPoints, this.nNeighbors);
        var embedding = initTransform(eIndices, eWeights, this.embedding);
        var nEpochs = this.nEpochs ? this.nEpochs / 3 : graph.nRows <= 1e4 ? 100 : 30;
        var graphMax = graph.getValues().reduce(function(max, val) {
          return val > max ? val : max;
        }, 0);
        graph = graph.map(function(value) {
          return value < graphMax / nEpochs ? 0 : value;
        });
        graph = matrix.eliminateZeros(graph);
        var epochsPerSample = this.makeEpochsPerSample(graph.getValues(), nEpochs);
        var head = graph.getRows();
        var tail = graph.getCols();
        this.assignOptimizationStateParameters({
          headEmbedding: embedding,
          tailEmbedding: this.embedding,
          head,
          tail,
          currentEpoch: 0,
          nEpochs,
          nVertices: graph.getDims()[1],
          epochsPerSample
        });
        this.prepareForOptimizationLoop();
        return this.optimizeLayout();
      };
      UMAP3.prototype.processGraphForSupervisedProjection = function() {
        var _a = this, Y = _a.Y, X = _a.X;
        if (Y) {
          if (Y.length !== X.length) {
            throw new Error("Length of X and y must be equal");
          }
          if (this.targetMetric === "categorical") {
            var lt = this.targetWeight < 1;
            var farDist = lt ? 2.5 * (1 / (1 - this.targetWeight)) : 1e12;
            this.graph = this.categoricalSimplicialSetIntersection(this.graph, Y, farDist);
          }
        }
      };
      UMAP3.prototype.step = function() {
        var currentEpoch = this.optimizationState.currentEpoch;
        if (currentEpoch < this.getNEpochs()) {
          this.optimizeLayoutStep(currentEpoch);
        }
        return this.optimizationState.currentEpoch;
      };
      UMAP3.prototype.getEmbedding = function() {
        return this.embedding;
      };
      UMAP3.prototype.nearestNeighbors = function(X) {
        var _a = this, distanceFn = _a.distanceFn, nNeighbors = _a.nNeighbors;
        var log2 = function(n) {
          return Math.log(n) / Math.log(2);
        };
        var metricNNDescent = nnDescent.makeNNDescent(distanceFn, this.random);
        var round = function(n) {
          return n === 0.5 ? 0 : Math.round(n);
        };
        var nTrees = 5 + Math.floor(round(Math.pow(X.length, 0.5) / 20));
        var nIters = Math.max(5, Math.floor(Math.round(log2(X.length))));
        this.rpForest = tree.makeForest(X, nNeighbors, nTrees, this.random);
        var leafArray = tree.makeLeafArray(this.rpForest);
        var _b = metricNNDescent(X, leafArray, nNeighbors, nIters), indices = _b.indices, weights = _b.weights;
        return { knnIndices: indices, knnDistances: weights };
      };
      UMAP3.prototype.fuzzySimplicialSet = function(X, nNeighbors, setOpMixRatio) {
        if (setOpMixRatio === void 0) {
          setOpMixRatio = 1;
        }
        var _a = this, _b = _a.knnIndices, knnIndices = _b === void 0 ? [] : _b, _c = _a.knnDistances, knnDistances = _c === void 0 ? [] : _c, localConnectivity = _a.localConnectivity;
        var _d = this.smoothKNNDistance(knnDistances, nNeighbors, localConnectivity), sigmas = _d.sigmas, rhos = _d.rhos;
        var _e = this.computeMembershipStrengths(knnIndices, knnDistances, sigmas, rhos), rows = _e.rows, cols = _e.cols, vals = _e.vals;
        var size = [X.length, X.length];
        var sparseMatrix = new matrix.SparseMatrix(rows, cols, vals, size);
        var transpose = matrix.transpose(sparseMatrix);
        var prodMatrix = matrix.pairwiseMultiply(sparseMatrix, transpose);
        var a = matrix.subtract(matrix.add(sparseMatrix, transpose), prodMatrix);
        var b = matrix.multiplyScalar(a, setOpMixRatio);
        var c = matrix.multiplyScalar(prodMatrix, 1 - setOpMixRatio);
        var result = matrix.add(b, c);
        return result;
      };
      UMAP3.prototype.categoricalSimplicialSetIntersection = function(simplicialSet, target, farDist, unknownDist) {
        if (unknownDist === void 0) {
          unknownDist = 1;
        }
        var intersection = fastIntersection(simplicialSet, target, unknownDist, farDist);
        intersection = matrix.eliminateZeros(intersection);
        return resetLocalConnectivity(intersection);
      };
      UMAP3.prototype.smoothKNNDistance = function(distances, k, localConnectivity, nIter, bandwidth) {
        if (localConnectivity === void 0) {
          localConnectivity = 1;
        }
        if (nIter === void 0) {
          nIter = 64;
        }
        if (bandwidth === void 0) {
          bandwidth = 1;
        }
        var target = Math.log(k) / Math.log(2) * bandwidth;
        var rho = utils.zeros(distances.length);
        var result = utils.zeros(distances.length);
        for (var i = 0; i < distances.length; i++) {
          var lo = 0;
          var hi = Infinity;
          var mid = 1;
          var ithDistances = distances[i];
          var nonZeroDists = ithDistances.filter(function(d2) {
            return d2 > 0;
          });
          if (nonZeroDists.length >= localConnectivity) {
            var index = Math.floor(localConnectivity);
            var interpolation = localConnectivity - index;
            if (index > 0) {
              rho[i] = nonZeroDists[index - 1];
              if (interpolation > SMOOTH_K_TOLERANCE) {
                rho[i] += interpolation * (nonZeroDists[index] - nonZeroDists[index - 1]);
              }
            } else {
              rho[i] = interpolation * nonZeroDists[0];
            }
          } else if (nonZeroDists.length > 0) {
            rho[i] = utils.max(nonZeroDists);
          }
          for (var n = 0; n < nIter; n++) {
            var psum = 0;
            for (var j = 1; j < distances[i].length; j++) {
              var d = distances[i][j] - rho[i];
              if (d > 0) {
                psum += Math.exp(-(d / mid));
              } else {
                psum += 1;
              }
            }
            if (Math.abs(psum - target) < SMOOTH_K_TOLERANCE) {
              break;
            }
            if (psum > target) {
              hi = mid;
              mid = (lo + hi) / 2;
            } else {
              lo = mid;
              if (hi === Infinity) {
                mid *= 2;
              } else {
                mid = (lo + hi) / 2;
              }
            }
          }
          result[i] = mid;
          if (rho[i] > 0) {
            var meanIthDistances = utils.mean(ithDistances);
            if (result[i] < MIN_K_DIST_SCALE * meanIthDistances) {
              result[i] = MIN_K_DIST_SCALE * meanIthDistances;
            }
          } else {
            var meanDistances = utils.mean(distances.map(utils.mean));
            if (result[i] < MIN_K_DIST_SCALE * meanDistances) {
              result[i] = MIN_K_DIST_SCALE * meanDistances;
            }
          }
        }
        return { sigmas: result, rhos: rho };
      };
      UMAP3.prototype.computeMembershipStrengths = function(knnIndices, knnDistances, sigmas, rhos) {
        var nSamples = knnIndices.length;
        var nNeighbors = knnIndices[0].length;
        var rows = utils.zeros(nSamples * nNeighbors);
        var cols = utils.zeros(nSamples * nNeighbors);
        var vals = utils.zeros(nSamples * nNeighbors);
        for (var i = 0; i < nSamples; i++) {
          for (var j = 0; j < nNeighbors; j++) {
            var val = 0;
            if (knnIndices[i][j] === -1) {
              continue;
            }
            if (knnIndices[i][j] === i) {
              val = 0;
            } else if (knnDistances[i][j] - rhos[i] <= 0) {
              val = 1;
            } else {
              val = Math.exp(-((knnDistances[i][j] - rhos[i]) / sigmas[i]));
            }
            rows[i * nNeighbors + j] = i;
            cols[i * nNeighbors + j] = knnIndices[i][j];
            vals[i * nNeighbors + j] = val;
          }
        }
        return { rows, cols, vals };
      };
      UMAP3.prototype.initializeSimplicialSetEmbedding = function() {
        var _this = this;
        var nEpochs = this.getNEpochs();
        var nComponents = this.nComponents;
        var graphValues = this.graph.getValues();
        var graphMax = 0;
        for (var i = 0; i < graphValues.length; i++) {
          var value = graphValues[i];
          if (graphMax < graphValues[i]) {
            graphMax = value;
          }
        }
        var graph = this.graph.map(function(value2) {
          if (value2 < graphMax / nEpochs) {
            return 0;
          } else {
            return value2;
          }
        });
        this.embedding = utils.zeros(graph.nRows).map(function() {
          return utils.zeros(nComponents).map(function() {
            return utils.tauRand(_this.random) * 20 + -10;
          });
        });
        var weights = [];
        var head = [];
        var tail = [];
        var rowColValues = graph.getAll();
        for (var i = 0; i < rowColValues.length; i++) {
          var entry = rowColValues[i];
          if (entry.value) {
            weights.push(entry.value);
            tail.push(entry.row);
            head.push(entry.col);
          }
        }
        var epochsPerSample = this.makeEpochsPerSample(weights, nEpochs);
        return { head, tail, epochsPerSample };
      };
      UMAP3.prototype.makeEpochsPerSample = function(weights, nEpochs) {
        var result = utils.filled(weights.length, -1);
        var max = utils.max(weights);
        var nSamples = weights.map(function(w) {
          return w / max * nEpochs;
        });
        nSamples.forEach(function(n, i) {
          if (n > 0)
            result[i] = nEpochs / nSamples[i];
        });
        return result;
      };
      UMAP3.prototype.assignOptimizationStateParameters = function(state) {
        Object.assign(this.optimizationState, state);
      };
      UMAP3.prototype.prepareForOptimizationLoop = function() {
        var _a = this, repulsionStrength = _a.repulsionStrength, learningRate = _a.learningRate, negativeSampleRate = _a.negativeSampleRate;
        var _b = this.optimizationState, epochsPerSample = _b.epochsPerSample, headEmbedding = _b.headEmbedding, tailEmbedding = _b.tailEmbedding;
        var dim = headEmbedding[0].length;
        var moveOther = headEmbedding.length === tailEmbedding.length;
        var epochsPerNegativeSample = epochsPerSample.map(function(e) {
          return e / negativeSampleRate;
        });
        var epochOfNextNegativeSample = __spread(epochsPerNegativeSample);
        var epochOfNextSample = __spread(epochsPerSample);
        this.assignOptimizationStateParameters({
          epochOfNextSample,
          epochOfNextNegativeSample,
          epochsPerNegativeSample,
          moveOther,
          initialAlpha: learningRate,
          alpha: learningRate,
          gamma: repulsionStrength,
          dim
        });
      };
      UMAP3.prototype.initializeOptimization = function() {
        var headEmbedding = this.embedding;
        var tailEmbedding = this.embedding;
        var _a = this.optimizationState, head = _a.head, tail = _a.tail, epochsPerSample = _a.epochsPerSample;
        var nEpochs = this.getNEpochs();
        var nVertices = this.graph.nCols;
        var _b = findABParams(this.spread, this.minDist), a = _b.a, b = _b.b;
        this.assignOptimizationStateParameters({
          headEmbedding,
          tailEmbedding,
          head,
          tail,
          epochsPerSample,
          a,
          b,
          nEpochs,
          nVertices
        });
      };
      UMAP3.prototype.optimizeLayoutStep = function(n) {
        var optimizationState = this.optimizationState;
        var head = optimizationState.head, tail = optimizationState.tail, headEmbedding = optimizationState.headEmbedding, tailEmbedding = optimizationState.tailEmbedding, epochsPerSample = optimizationState.epochsPerSample, epochOfNextSample = optimizationState.epochOfNextSample, epochOfNextNegativeSample = optimizationState.epochOfNextNegativeSample, epochsPerNegativeSample = optimizationState.epochsPerNegativeSample, moveOther = optimizationState.moveOther, initialAlpha = optimizationState.initialAlpha, alpha = optimizationState.alpha, gamma = optimizationState.gamma, a = optimizationState.a, b = optimizationState.b, dim = optimizationState.dim, nEpochs = optimizationState.nEpochs, nVertices = optimizationState.nVertices;
        var clipValue = 4;
        for (var i = 0; i < epochsPerSample.length; i++) {
          if (epochOfNextSample[i] > n) {
            continue;
          }
          var j = head[i];
          var k = tail[i];
          var current = headEmbedding[j];
          var other = tailEmbedding[k];
          var distSquared = rDist(current, other);
          var gradCoeff = 0;
          if (distSquared > 0) {
            gradCoeff = -2 * a * b * Math.pow(distSquared, b - 1);
            gradCoeff /= a * Math.pow(distSquared, b) + 1;
          }
          for (var d = 0; d < dim; d++) {
            var gradD = clip(gradCoeff * (current[d] - other[d]), clipValue);
            current[d] += gradD * alpha;
            if (moveOther) {
              other[d] += -gradD * alpha;
            }
          }
          epochOfNextSample[i] += epochsPerSample[i];
          var nNegSamples = Math.floor((n - epochOfNextNegativeSample[i]) / epochsPerNegativeSample[i]);
          for (var p = 0; p < nNegSamples; p++) {
            var k_1 = utils.tauRandInt(nVertices, this.random);
            var other_1 = tailEmbedding[k_1];
            var distSquared_1 = rDist(current, other_1);
            var gradCoeff_1 = 0;
            if (distSquared_1 > 0) {
              gradCoeff_1 = 2 * gamma * b;
              gradCoeff_1 /= (1e-3 + distSquared_1) * (a * Math.pow(distSquared_1, b) + 1);
            } else if (j === k_1) {
              continue;
            }
            for (var d = 0; d < dim; d++) {
              var gradD = 4;
              if (gradCoeff_1 > 0) {
                gradD = clip(gradCoeff_1 * (current[d] - other_1[d]), clipValue);
              }
              current[d] += gradD * alpha;
            }
          }
          epochOfNextNegativeSample[i] += nNegSamples * epochsPerNegativeSample[i];
        }
        optimizationState.alpha = initialAlpha * (1 - n / nEpochs);
        optimizationState.currentEpoch += 1;
        return headEmbedding;
      };
      UMAP3.prototype.optimizeLayoutAsync = function(epochCallback) {
        var _this = this;
        if (epochCallback === void 0) {
          epochCallback = function() {
            return true;
          };
        }
        return new Promise(function(resolve, reject) {
          var step = function() {
            return __awaiter(_this, void 0, void 0, function() {
              var _a, nEpochs, currentEpoch, epochCompleted, shouldStop, isFinished;
              return __generator(this, function(_b) {
                try {
                  _a = this.optimizationState, nEpochs = _a.nEpochs, currentEpoch = _a.currentEpoch;
                  this.embedding = this.optimizeLayoutStep(currentEpoch);
                  epochCompleted = this.optimizationState.currentEpoch;
                  shouldStop = epochCallback(epochCompleted) === false;
                  isFinished = epochCompleted === nEpochs;
                  if (!shouldStop && !isFinished) {
                    setTimeout(function() {
                      return step();
                    }, 0);
                  } else {
                    return [2, resolve(isFinished)];
                  }
                } catch (err) {
                  reject(err);
                }
                return [2];
              });
            });
          };
          setTimeout(function() {
            return step();
          }, 0);
        });
      };
      UMAP3.prototype.optimizeLayout = function(epochCallback) {
        if (epochCallback === void 0) {
          epochCallback = function() {
            return true;
          };
        }
        var isFinished = false;
        var embedding = [];
        while (!isFinished) {
          var _a = this.optimizationState, nEpochs = _a.nEpochs, currentEpoch = _a.currentEpoch;
          embedding = this.optimizeLayoutStep(currentEpoch);
          var epochCompleted = this.optimizationState.currentEpoch;
          var shouldStop = epochCallback(epochCompleted) === false;
          isFinished = epochCompleted === nEpochs || shouldStop;
        }
        return embedding;
      };
      UMAP3.prototype.getNEpochs = function() {
        var graph = this.graph;
        if (this.nEpochs > 0) {
          return this.nEpochs;
        }
        var length = graph.nRows;
        if (length <= 2500) {
          return 500;
        } else if (length <= 5e3) {
          return 400;
        } else if (length <= 7500) {
          return 300;
        } else {
          return 200;
        }
      };
      return UMAP3;
    }();
    exports.UMAP = UMAP2;
    function euclidean(x, y) {
      var result = 0;
      for (var i = 0; i < x.length; i++) {
        result += Math.pow(x[i] - y[i], 2);
      }
      return Math.sqrt(result);
    }
    exports.euclidean = euclidean;
    function cosine(x, y) {
      var result = 0;
      var normX = 0;
      var normY = 0;
      for (var i = 0; i < x.length; i++) {
        result += x[i] * y[i];
        normX += Math.pow(x[i], 2);
        normY += Math.pow(y[i], 2);
      }
      if (normX === 0 && normY === 0) {
        return 0;
      } else if (normX === 0 || normY === 0) {
        return 1;
      } else {
        return 1 - result / Math.sqrt(normX * normY);
      }
    }
    exports.cosine = cosine;
    var OptimizationState = /* @__PURE__ */ function() {
      function OptimizationState2() {
        this.currentEpoch = 0;
        this.headEmbedding = [];
        this.tailEmbedding = [];
        this.head = [];
        this.tail = [];
        this.epochsPerSample = [];
        this.epochOfNextSample = [];
        this.epochOfNextNegativeSample = [];
        this.epochsPerNegativeSample = [];
        this.moveOther = true;
        this.initialAlpha = 1;
        this.alpha = 1;
        this.gamma = 1;
        this.a = 1.5769434603113077;
        this.b = 0.8950608779109733;
        this.dim = 2;
        this.nEpochs = 500;
        this.nVertices = 0;
      }
      return OptimizationState2;
    }();
    function clip(x, clipValue) {
      if (x > clipValue)
        return clipValue;
      else if (x < -clipValue)
        return -clipValue;
      else
        return x;
    }
    function rDist(x, y) {
      var result = 0;
      for (var i = 0; i < x.length; i++) {
        result += Math.pow(x[i] - y[i], 2);
      }
      return result;
    }
    function findABParams(spread, minDist) {
      var curve = function(_a2) {
        var _b = __read(_a2, 2), a2 = _b[0], b2 = _b[1];
        return function(x) {
          return 1 / (1 + a2 * Math.pow(x, 2 * b2));
        };
      };
      var xv = utils.linear(0, spread * 3, 300).map(function(val) {
        return val < minDist ? 1 : val;
      });
      var yv = utils.zeros(xv.length).map(function(val, index) {
        var gte = xv[index] >= minDist;
        return gte ? Math.exp(-(xv[index] - minDist) / spread) : val;
      });
      var initialValues = [0.5, 0.5];
      var data = { x: xv, y: yv };
      var options = {
        damping: 1.5,
        initialValues,
        gradientDifference: 0.1,
        maxIterations: 100,
        errorTolerance: 0.01
      };
      var parameterValues = ml_levenberg_marquardt_1.default(data, curve, options).parameterValues;
      var _a = __read(parameterValues, 2), a = _a[0], b = _a[1];
      return { a, b };
    }
    exports.findABParams = findABParams;
    function fastIntersection(graph, target, unknownDist, farDist) {
      if (unknownDist === void 0) {
        unknownDist = 1;
      }
      if (farDist === void 0) {
        farDist = 5;
      }
      return graph.map(function(value, row, col) {
        if (target[row] === -1 || target[col] === -1) {
          return value * Math.exp(-unknownDist);
        } else if (target[row] !== target[col]) {
          return value * Math.exp(-farDist);
        } else {
          return value;
        }
      });
    }
    exports.fastIntersection = fastIntersection;
    function resetLocalConnectivity(simplicialSet) {
      simplicialSet = matrix.normalize(simplicialSet, "max");
      var transpose = matrix.transpose(simplicialSet);
      var prodMatrix = matrix.pairwiseMultiply(transpose, simplicialSet);
      simplicialSet = matrix.add(simplicialSet, matrix.subtract(transpose, prodMatrix));
      return matrix.eliminateZeros(simplicialSet);
    }
    exports.resetLocalConnectivity = resetLocalConnectivity;
    function initTransform(indices, weights, embedding) {
      var result = utils.zeros(indices.length).map(function(z) {
        return utils.zeros(embedding[0].length);
      });
      for (var i = 0; i < indices.length; i++) {
        for (var j = 0; j < indices[0].length; j++) {
          for (var d = 0; d < embedding[0].length; d++) {
            var a = indices[i][j];
            result[i][d] += weights[i][j] * embedding[a][d];
          }
        }
      }
      return result;
    }
    exports.initTransform = initTransform;
  }
});

// node_modules/umap-js/dist/index.js
var require_dist = __commonJS({
  "node_modules/umap-js/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var umap_1 = require_umap();
    Object.defineProperty(exports, "UMAP", { enumerable: true, get: function() {
      return umap_1.UMAP;
    } });
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ChorographiaPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  embeddingProvider: "ollama",
  ollamaUrl: "http://localhost:11434",
  ollamaEmbedModel: "qwen3-embedding",
  ollamaLlmModel: "qwen3:8b",
  llmProvider: "ollama",
  openaiApiKey: "",
  embeddingModel: "text-embedding-3-large",
  openrouterApiKey: "",
  openrouterEmbedModel: "openai/text-embedding-3-small",
  openrouterLlmModel: "google/gemini-2.0-flash-001",
  includeGlobs: "**/*.md",
  excludeGlobs: "templates/**",
  maxNotes: 2e3,
  showLinks: false,
  colorMode: "semantic",
  showExplorerDots: true,
  minimapCorner: "bottom-left",
  showZones: false,
  zoneGranularity: 6,
  enableLLMZoneNaming: false,
  zoneStyle: "starmap",
  worldmapSeaLevel: 0.2,
  worldmapUnity: 0.07,
  worldmapRuggedness: 0.4,
  mapLocked: true,
  showSubZones: true,
  showNoteTitles: true
};
var ChorographiaSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const needsOllama = this.plugin.settings.embeddingProvider === "ollama" || this.plugin.settings.llmProvider === "ollama";
    const needsOpenAI = this.plugin.settings.embeddingProvider === "openai" || this.plugin.settings.llmProvider === "openai";
    const needsOpenRouter = this.plugin.settings.embeddingProvider === "openrouter" || this.plugin.settings.llmProvider === "openrouter";
    if (needsOllama || needsOpenAI || needsOpenRouter) {
      containerEl.createEl("h3", { text: "Providers" });
      containerEl.createEl("p", {
        text: "Connection details for services used by embedding or zone naming below.",
        cls: "setting-item-description"
      });
      if (needsOllama) {
        new import_obsidian.Setting(containerEl).setName("Ollama URL").setDesc("Base URL for the local Ollama server.").addText(
          (text) => text.setPlaceholder("http://localhost:11434").setValue(this.plugin.settings.ollamaUrl).onChange(async (value) => {
            this.plugin.settings.ollamaUrl = value;
            await this.plugin.saveSettings();
          }).then((t) => {
            t.inputEl.style.width = "250px";
          })
        );
      }
      if (needsOpenAI) {
        new import_obsidian.Setting(containerEl).setName("OpenAI API key").addText(
          (text) => text.setPlaceholder("sk-...").setValue(this.plugin.settings.openaiApiKey).onChange(async (value) => {
            this.plugin.settings.openaiApiKey = value;
            await this.plugin.saveSettings();
          }).then((t) => {
            t.inputEl.type = "password";
            t.inputEl.style.width = "300px";
          })
        );
      }
      if (needsOpenRouter) {
        new import_obsidian.Setting(containerEl).setName("OpenRouter API key").setDesc("Get one at openrouter.ai/keys.").addText(
          (text) => text.setPlaceholder("sk-or-...").setValue(this.plugin.settings.openrouterApiKey).onChange(async (value) => {
            this.plugin.settings.openrouterApiKey = value;
            await this.plugin.saveSettings();
          }).then((t) => {
            t.inputEl.type = "password";
            t.inputEl.style.width = "300px";
          })
        );
      }
    }
    containerEl.createEl("h3", { text: "Embedding" });
    containerEl.createEl("p", {
      text: "Choose how note content is converted into vectors for the map layout.",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(containerEl).setName("Provider").addDropdown(
      (dd) => dd.addOption("ollama", "Ollama (local)").addOption("openai", "OpenAI").addOption("openrouter", "OpenRouter").setValue(this.plugin.settings.embeddingProvider).onChange(async (value) => {
        this.plugin.settings.embeddingProvider = value;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    if (this.plugin.settings.embeddingProvider === "ollama") {
      new import_obsidian.Setting(containerEl).setName("Embedding model").setDesc("Ollama model name (e.g. qwen3-embedding).").addText(
        (text) => text.setValue(this.plugin.settings.ollamaEmbedModel).onChange(async (value) => {
          this.plugin.settings.ollamaEmbedModel = value;
          await this.plugin.saveSettings();
        })
      );
    } else if (this.plugin.settings.embeddingProvider === "openai") {
      new import_obsidian.Setting(containerEl).setName("Embedding model").setDesc("OpenAI model name (e.g. text-embedding-3-large).").addText(
        (text) => text.setValue(this.plugin.settings.embeddingModel).onChange(async (value) => {
          this.plugin.settings.embeddingModel = value;
          await this.plugin.saveSettings();
        })
      );
    } else if (this.plugin.settings.embeddingProvider === "openrouter") {
      new import_obsidian.Setting(containerEl).setName("Embedding model").setDesc("OpenRouter model ID (e.g. openai/text-embedding-3-small).").addText(
        (text) => text.setValue(this.plugin.settings.openrouterEmbedModel).onChange(async (value) => {
          this.plugin.settings.openrouterEmbedModel = value;
          await this.plugin.saveSettings();
        })
      );
    }
    new import_obsidian.Setting(containerEl).setName("Include globs").setDesc("Comma-separated glob patterns for notes to index.").addText(
      (text) => text.setPlaceholder("**/*.md").setValue(this.plugin.settings.includeGlobs).onChange(async (value) => {
        this.plugin.settings.includeGlobs = value;
        await this.plugin.saveSettings();
      }).then((t) => {
        t.inputEl.style.width = "400px";
      })
    );
    new import_obsidian.Setting(containerEl).setName("Exclude globs").setDesc("Comma-separated glob patterns for notes to skip.").addText(
      (text) => text.setPlaceholder("templates/**,daily/**").setValue(this.plugin.settings.excludeGlobs).onChange(async (value) => {
        this.plugin.settings.excludeGlobs = value;
        await this.plugin.saveSettings();
      }).then((t) => {
        t.inputEl.style.width = "400px";
      })
    );
    new import_obsidian.Setting(containerEl).setName("Max notes").setDesc("Safety cap on number of notes to index.").addText(
      (text) => text.setValue(String(this.plugin.settings.maxNotes)).onChange(async (value) => {
        const n = parseInt(value, 10);
        if (!isNaN(n) && n > 0) {
          this.plugin.settings.maxNotes = n;
          await this.plugin.saveSettings();
        }
      })
    );
    containerEl.createEl("h3", { text: "Semantic Zones" });
    containerEl.createEl("p", {
      text: "Group nearby notes into labeled regions on the map using k-means clustering.",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(containerEl).setName("Show semantic zones").setDesc("Display thematic cluster regions behind points on the map.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showZones).onChange(async (value) => {
        this.plugin.settings.showZones = value;
        await this.plugin.saveSettings();
        this.display();
        this.plugin.refreshMapViews();
      })
    );
    if (this.plugin.settings.showZones) {
      new import_obsidian.Setting(containerEl).setName("Zone granularity").setDesc("Number of zone clusters (3\u201324). Higher = more, smaller zones.").addDropdown((dd) => {
        for (let n = 3; n <= 24; n++)
          dd.addOption(String(n), String(n));
        dd.setValue(String(this.plugin.settings.zoneGranularity));
        dd.onChange(async (value) => {
          this.plugin.settings.zoneGranularity = parseInt(value, 10);
          await this.plugin.saveSettings();
          this.plugin.refreshMapViews();
        });
      });
      new import_obsidian.Setting(containerEl).setName("Zone style").setDesc("Star map: overlapping smooth blobs. World map: non-overlapping country shapes with fractal borders.").addDropdown((dd) => {
        dd.addOption("starmap", "Star map");
        dd.addOption("worldmap", "World map");
        dd.setValue(this.plugin.settings.zoneStyle);
        dd.onChange(async (value) => {
          this.plugin.settings.zoneStyle = value;
          await this.plugin.saveSettings();
          this.plugin.refreshMapViews();
          this.display();
        });
      });
      if (this.plugin.settings.zoneStyle === "worldmap") {
        new import_obsidian.Setting(containerEl).setName("Land density").setDesc("% of peak height that becomes land. High = sparse thin countries, low = thick flooded land.").addSlider(
          (sl) => sl.setLimits(0.05, 0.5, 0.01).setValue(this.plugin.settings.worldmapSeaLevel).setDynamicTooltip().onChange(async (value) => {
            this.plugin.settings.worldmapSeaLevel = value;
            await this.plugin.saveSettings();
            this.plugin.refreshMapViews();
          })
        );
        new import_obsidian.Setting(containerEl).setName("Continental unity").setDesc("How far clusters reach to merge. Low = archipelago, high = pangea.").addSlider(
          (sl) => sl.setLimits(0.03, 0.12, 5e-3).setValue(this.plugin.settings.worldmapUnity).setDynamicTooltip().onChange(async (value) => {
            this.plugin.settings.worldmapUnity = value;
            await this.plugin.saveSettings();
            this.plugin.refreshMapViews();
          })
        );
        new import_obsidian.Setting(containerEl).setName("Coast ruggedness").setDesc("Higher = jagged fjords, lower = smooth beaches.").addSlider(
          (sl) => sl.setLimits(0.1, 1, 0.05).setValue(this.plugin.settings.worldmapRuggedness).setDynamicTooltip().onChange(async (value) => {
            this.plugin.settings.worldmapRuggedness = value;
            await this.plugin.saveSettings();
            this.plugin.refreshMapViews();
          })
        );
      }
      new import_obsidian.Setting(containerEl).setName("LLM zone naming").setDesc("Use an LLM to generate evocative names for each zone.").addToggle(
        (toggle) => toggle.setValue(this.plugin.settings.enableLLMZoneNaming).onChange(async (value) => {
          this.plugin.settings.enableLLMZoneNaming = value;
          await this.plugin.saveSettings();
          this.display();
          this.plugin.refreshMapViews();
        })
      );
      if (this.plugin.settings.enableLLMZoneNaming) {
        new import_obsidian.Setting(containerEl).setName("Zone naming provider").addDropdown(
          (dd) => dd.addOption("ollama", "Ollama (local)").addOption("openai", "OpenAI").addOption("openrouter", "OpenRouter").setValue(this.plugin.settings.llmProvider).onChange(async (value) => {
            this.plugin.settings.llmProvider = value;
            await this.plugin.saveSettings();
            this.display();
          })
        );
        if (this.plugin.settings.llmProvider === "ollama") {
          new import_obsidian.Setting(containerEl).setName("LLM model").setDesc("Ollama model for zone naming (e.g. qwen3:8b).").addText(
            (text) => text.setValue(this.plugin.settings.ollamaLlmModel).onChange(async (value) => {
              this.plugin.settings.ollamaLlmModel = value;
              await this.plugin.saveSettings();
            })
          );
        } else if (this.plugin.settings.llmProvider === "openrouter") {
          new import_obsidian.Setting(containerEl).setName("LLM model").setDesc("OpenRouter model ID (e.g. google/gemini-2.0-flash-001).").addText(
            (text) => text.setValue(this.plugin.settings.openrouterLlmModel).onChange(async (value) => {
              this.plugin.settings.openrouterLlmModel = value;
              await this.plugin.saveSettings();
            })
          );
        }
      }
      new import_obsidian.Setting(containerEl).setName("Lock map").setDesc("Preserve note positions, cluster assignments, and zone names across re-embeds.").addToggle(
        (toggle) => toggle.setValue(this.plugin.settings.mapLocked).onChange(async (value) => {
          this.plugin.settings.mapLocked = value;
          await this.plugin.saveSettings();
          this.plugin.refreshMapViews();
        })
      );
    }
    containerEl.createEl("h3", { text: "Map Display" });
    containerEl.createEl("p", {
      text: "Visual appearance of the map canvas and file explorer integration.",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(containerEl).setName("Color mode").setDesc("How to color points on the map.").addDropdown(
      (dd) => dd.addOption("semantic", "Semantic").addOption("folder", "Folder").addOption("type", "Type (frontmatter)").addOption("cat", "Category (frontmatter)").setValue(this.plugin.settings.colorMode).onChange(async (value) => {
        this.plugin.settings.colorMode = value;
        await this.plugin.saveSettings();
        this.plugin.refreshMapViews();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Show link overlay").setDesc("Draw wikilink edges between notes on the map.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showLinks).onChange(async (value) => {
        this.plugin.settings.showLinks = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("File explorer dots").setDesc("Show colored semantic circles next to notes in the file explorer.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showExplorerDots).onChange(async (value) => {
        this.plugin.settings.showExplorerDots = value;
        await this.plugin.saveSettings();
        this.plugin.updateExplorerDots();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Minimap corner").setDesc("Corner for the global minimap shown in local view.").addDropdown(
      (dd) => dd.addOption("off", "Off").addOption("top-left", "Top-left").addOption("top-right", "Top-right").addOption("bottom-left", "Bottom-left").addOption("bottom-right", "Bottom-right").setValue(this.plugin.settings.minimapCorner).onChange(async (value) => {
        this.plugin.settings.minimapCorner = value;
        await this.plugin.saveSettings();
        this.plugin.refreshMapViews();
      })
    );
    containerEl.createEl("h3", { text: "Actions" });
    new import_obsidian.Setting(containerEl).setName("Re-embed changed notes").setDesc("Index notes and compute embeddings for new/changed notes.").addButton(
      (btn) => btn.setButtonText("Run").onClick(async () => {
        btn.setDisabled(true);
        btn.setButtonText("Running...");
        try {
          await this.plugin.runEmbedPipeline();
          new import_obsidian.Notice("Chorographia: Embedding complete.");
        } catch (e) {
          new import_obsidian.Notice("Chorographia: " + e.message);
        }
        btn.setDisabled(false);
        btn.setButtonText("Run");
      })
    );
    new import_obsidian.Setting(containerEl).setName("Recompute layout").setDesc("Run UMAP on cached embeddings to produce a new 2D layout.").addButton(
      (btn) => btn.setButtonText("Run").onClick(async () => {
        btn.setDisabled(true);
        btn.setButtonText("Running...");
        try {
          await this.plugin.runLayoutCompute();
          new import_obsidian.Notice("Chorographia: Layout complete.");
        } catch (e) {
          new import_obsidian.Notice("Chorographia: " + e.message);
        }
        btn.setDisabled(false);
        btn.setButtonText("Run");
      })
    );
    if (this.plugin.settings.enableLLMZoneNaming) {
      new import_obsidian.Setting(containerEl).setName("Re-run zone naming").setDesc("Regenerate LLM names for all zones and sub-zones.").addButton(
        (btn) => btn.setButtonText("Run").onClick(async () => {
          if (this.plugin.settings.mapLocked) {
            if (!confirm("Map is locked. This will regenerate all zone names. Continue?"))
              return;
          }
          btn.setDisabled(true);
          btn.setButtonText("Running...");
          try {
            await this.plugin.runZoneNaming();
            new import_obsidian.Notice("Chorographia: Zone naming complete.");
          } catch (e) {
            new import_obsidian.Notice("Chorographia: " + e.message);
          }
          btn.setDisabled(false);
          btn.setButtonText("Run");
        })
      );
    }
    new import_obsidian.Setting(containerEl).setName("Clear cache").setDesc("Delete all cached embeddings and layout data.").addButton(
      (btn) => btn.setButtonText("Clear").setWarning().onClick(async () => {
        const locked = this.plugin.settings.mapLocked;
        const msg = locked ? "Map is locked. Clearing cache will erase all positions, zone data, and locked names. Continue?" : "This will erase all cached embeddings, positions, and zone data. You will need to re-embed to rebuild the map. Continue?";
        if (!confirm(msg))
          return;
        this.plugin.cache = { notes: {} };
        if (locked) {
          this.plugin.settings.mapLocked = false;
          await this.plugin.saveSettings();
        }
        await this.plugin.saveCache();
        new import_obsidian.Notice("Chorographia: Cache cleared.");
        this.display();
      })
    );
  }
};

// src/indexer.ts
var WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
function matchesGlob(path, pattern) {
  const re = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\xA7\xA7").replace(/\*/g, "[^/]*").replace(/§§/g, ".*");
  return new RegExp("^" + re + "$").test(path);
}
async function indexVault(vault, globs, excludeGlobs, maxNotes) {
  const files = vault.getMarkdownFiles();
  const byBasename = /* @__PURE__ */ new Map();
  for (const f of files) {
    const bn = f.basename.toLowerCase();
    byBasename.set(bn, f.path);
  }
  let matched = [];
  for (const f of files) {
    let included = false;
    for (const g of globs) {
      if (matchesGlob(f.path, g)) {
        included = true;
        break;
      }
    }
    if (!included)
      continue;
    let excluded = false;
    for (const g of excludeGlobs) {
      if (matchesGlob(f.path, g)) {
        excluded = true;
        break;
      }
    }
    if (!excluded)
      matched.push(f);
  }
  if (matched.length > maxNotes) {
    matched = matched.slice(0, maxNotes);
  }
  const matchedPaths = new Set(matched.map((f) => f.path));
  const results = [];
  for (const file of matched) {
    const content = await vault.cachedRead(file);
    const fm = parseFrontmatter(content);
    const title = fm.title || file.basename;
    const type = fm.type || "";
    const cat = fm.cat || "";
    const topics = Array.isArray(fm.topics) ? fm.topics.map(String).join(", ") : "";
    const body = stripFrontmatter(content).slice(0, 12e3);
    const embedText = [
      title ? `title: ${title}` : null,
      type ? `type: ${type}` : null,
      cat ? `cat: ${cat}` : null,
      topics ? `topics: ${topics}` : null,
      "",
      body
    ].filter((x) => x !== null).join("\n");
    const sha256 = await sha256Hex(embedText);
    const links = [];
    let m;
    const linkRe = new RegExp(WIKILINK_RE.source, "g");
    while ((m = linkRe.exec(content)) !== null) {
      const target = m[1].trim().toLowerCase();
      const resolved = byBasename.get(target);
      if (resolved && matchedPaths.has(resolved)) {
        links.push(resolved);
      }
    }
    const folder = file.path.includes("/") ? file.path.split("/")[0] : "";
    results.push({
      path: file.path,
      title,
      folder,
      noteType: type,
      cat,
      embedText,
      sha256,
      links: [...new Set(links)]
    });
  }
  return results;
}
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match)
    return {};
  const block = match[1];
  const result = {};
  for (const line of block.split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 0)
      continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
    }
    result[key] = val;
  }
  return result;
}
function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}
async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// src/openai.ts
var import_obsidian2 = require("obsidian");

// src/cache.ts
function encodeFloat32(arr) {
  const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function decodeFloat32(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}

// src/openai.ts
var BATCH_SIZE = 50;
var DELAY_MS = 200;
async function embedTexts(texts, apiKey, model, onProgress) {
  if (!apiKey)
    throw new Error("OpenAI API key not set.");
  const results = [];
  const skipped = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    try {
      const batchResults = await embedBatch(batch, apiKey, model);
      results.push(...batchResults);
    } catch (e) {
      if (e.status === 400 && batch.length > 1) {
        for (const item of batch) {
          try {
            const single = await embedBatch([item], apiKey, model);
            results.push(...single);
          } catch (e2) {
            const msg = e2.message || `HTTP ${e2.status}`;
            console.warn(`Chorographia: Skipping "${item.path}": ${msg}`);
            skipped.push(item.path);
          }
        }
      } else {
        throw e;
      }
    }
    onProgress?.(Math.min(i + BATCH_SIZE, texts.length), texts.length);
    if (i + BATCH_SIZE < texts.length) {
      await sleep(DELAY_MS);
    }
  }
  if (skipped.length > 0) {
    console.warn(`Chorographia: Skipped ${skipped.length} notes due to API errors:`, skipped);
  }
  return results;
}
async function embedBatch(batch, apiKey, model) {
  const resp = await (0, import_obsidian2.requestUrl)({
    url: "https://api.openai.com/v1/embeddings",
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: batch.map((b) => b.text)
    })
  });
  if (resp.status !== 200) {
    const msg = resp.json?.error?.message || `HTTP ${resp.status}`;
    const err = new Error(`OpenAI API error: ${msg}`);
    err.status = resp.status;
    throw err;
  }
  const results = [];
  const data = resp.json.data;
  for (const d of data) {
    const arr = new Float32Array(d.embedding);
    results.push({
      path: batch[d.index].path,
      embedding: encodeFloat32(arr)
    });
  }
  return results;
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// src/ollama.ts
var import_obsidian3 = require("obsidian");
var BATCH_SIZE2 = 50;
async function embedTextsOllama(texts, baseUrl, model, onProgress) {
  const results = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE2) {
    const batch = texts.slice(i, i + BATCH_SIZE2);
    const resp = await (0, import_obsidian3.requestUrl)({
      url: `${baseUrl}/api/embed`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        input: batch.map((b) => b.text)
      })
    });
    if (resp.status !== 200) {
      const msg = resp.json?.error || `HTTP ${resp.status}`;
      throw new Error(`Ollama embed error: ${msg}`);
    }
    const embeddings = resp.json.embeddings;
    for (let j = 0; j < embeddings.length; j++) {
      const arr = new Float32Array(embeddings[j]);
      results.push({
        path: batch[j].path,
        embedding: encodeFloat32(arr)
      });
    }
    onProgress?.(Math.min(i + BATCH_SIZE2, texts.length), texts.length);
  }
  return results;
}
async function generateZoneNamesOllama(clusters, baseUrl, model) {
  const result = /* @__PURE__ */ new Map();
  if (clusters.length === 0)
    return result;
  const clusterDescs = clusters.map((c) => {
    const sample = c.titles.slice(0, 15).join(", ");
    return `Cluster ${c.idx}: ${sample}`;
  }).join("\n");
  try {
    const resp = await (0, import_obsidian3.requestUrl)({
      url: `${baseUrl}/api/chat`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are naming regions on a knowledge map. For each cluster of note titles, produce a short evocative name (2-4 words) that captures the thematic essence. Respond with one name per line in the format: CLUSTER_NUM: Name\n/nothink"
          },
          {
            role: "user",
            content: `Name each knowledge region:

${clusterDescs}`
          }
        ],
        stream: false,
        think: false
      })
    });
    if (resp.status !== 200) {
      console.warn("Chorographia: Ollama zone naming returned", resp.status);
      return result;
    }
    let text = resp.json?.message?.content || "";
    text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    for (const line of text.split("\n")) {
      const match = line.match(/(\d+)\s*:\s*(.+)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const name = match[2].trim();
        if (name)
          result.set(idx, name);
      }
    }
  } catch (e) {
    console.warn("Chorographia: Ollama zone naming failed:", e);
  }
  return result;
}

// src/openrouter.ts
var import_obsidian4 = require("obsidian");
var BATCH_SIZE3 = 50;
var DELAY_MS2 = 200;
async function embedTextsOpenRouter(texts, apiKey, model, onProgress) {
  if (!apiKey)
    throw new Error("OpenRouter API key not set.");
  const results = [];
  const skipped = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE3) {
    const batch = texts.slice(i, i + BATCH_SIZE3);
    try {
      const batchResults = await embedBatch2(batch, apiKey, model);
      results.push(...batchResults);
    } catch (e) {
      if (e.status === 400 && batch.length > 1) {
        for (const item of batch) {
          try {
            const single = await embedBatch2([item], apiKey, model);
            results.push(...single);
          } catch (e2) {
            const msg = e2.message || `HTTP ${e2.status}`;
            console.warn(`Chorographia: Skipping "${item.path}": ${msg}`);
            skipped.push(item.path);
          }
        }
      } else {
        throw e;
      }
    }
    onProgress?.(Math.min(i + BATCH_SIZE3, texts.length), texts.length);
    if (i + BATCH_SIZE3 < texts.length) {
      await sleep2(DELAY_MS2);
    }
  }
  if (skipped.length > 0) {
    console.warn(`Chorographia: Skipped ${skipped.length} notes due to API errors:`, skipped);
  }
  return results;
}
async function embedBatch2(batch, apiKey, model) {
  const resp = await (0, import_obsidian4.requestUrl)({
    url: "https://openrouter.ai/api/v1/embeddings",
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: batch.map((b) => b.text)
    })
  });
  if (resp.status !== 200) {
    const msg = resp.json?.error?.message || `HTTP ${resp.status}`;
    const err = new Error(`OpenRouter API error: ${msg}`);
    err.status = resp.status;
    throw err;
  }
  const results = [];
  const data = resp.json.data;
  for (const d of data) {
    const arr = new Float32Array(d.embedding);
    results.push({
      path: batch[d.index].path,
      embedding: encodeFloat32(arr)
    });
  }
  return results;
}
async function generateZoneNamesOpenRouter(clusters, apiKey, model) {
  const result = /* @__PURE__ */ new Map();
  if (!apiKey || clusters.length === 0)
    return result;
  const clusterDescs = clusters.map((c) => {
    const sample = c.titles.slice(0, 15).join(", ");
    return `Cluster ${c.idx}: ${sample}`;
  }).join("\n");
  try {
    const resp = await (0, import_obsidian4.requestUrl)({
      url: "https://openrouter.ai/api/v1/chat/completions",
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are naming regions on a knowledge map. For each cluster of note titles, produce a short evocative name (2-4 words) that captures the thematic essence. Respond with one name per line in the format: CLUSTER_NUM: Name"
          },
          {
            role: "user",
            content: `Name each knowledge region:

${clusterDescs}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    if (resp.status !== 200)
      return result;
    const text = resp.json?.choices?.[0]?.message?.content || "";
    for (const line of text.split("\n")) {
      const match = line.match(/(\d+)\s*:\s*(.+)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const name = match[2].trim();
        if (name)
          result.set(idx, name);
      }
    }
  } catch {
  }
  return result;
}
function sleep2(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// src/layout.ts
var import_umap_js = __toESM(require_dist());
function euclideanDistF32(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function computeLayout(notes, seed = 42) {
  const paths = [];
  const vectors = [];
  for (const [path, note] of Object.entries(notes)) {
    if (!note.embedding)
      continue;
    paths.push(path);
    vectors.push(decodeFloat32(note.embedding));
  }
  if (paths.length < 2) {
    return paths.map((p) => ({ path: p, x: 0, y: 0 }));
  }
  const data = vectors.map((v) => Array.from(v));
  const nNeighbors = Math.min(15, paths.length - 1);
  const umap = new import_umap_js.UMAP({
    nComponents: 2,
    nNeighbors,
    minDist: 0.15,
    spread: 1,
    random: mulberry32(seed)
  });
  const coords = umap.fit(data);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX)
      minX = x;
    if (x > maxX)
      maxX = x;
    if (y < minY)
      minY = y;
    if (y > maxY)
      maxY = y;
  }
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  return paths.map((path, i) => ({
    path,
    x: (coords[i][0] - minX) / rangeX * 2 - 1,
    y: (coords[i][1] - minY) / rangeY * 2 - 1
  }));
}
function interpolateNewPoints(notes, newPaths, kNeighbors = 5) {
  const anchors = [];
  for (const [path, n] of Object.entries(notes)) {
    if (n.embedding && n.x != null && n.y != null) {
      anchors.push({ path, embedding: decodeFloat32(n.embedding), x: n.x, y: n.y });
    }
  }
  if (anchors.length === 0)
    return [];
  const k = Math.min(kNeighbors, anchors.length);
  const results = [];
  for (const path of newPaths) {
    const note = notes[path];
    if (!note?.embedding)
      continue;
    const vec = decodeFloat32(note.embedding);
    const dists = [];
    for (let i = 0; i < anchors.length; i++) {
      dists.push({ idx: i, dist: euclideanDistF32(vec, anchors[i].embedding) });
    }
    dists.sort((a, b) => a.dist - b.dist);
    const nearest = dists.slice(0, k);
    let totalW = 0;
    let wx = 0, wy = 0;
    for (const { idx, dist } of nearest) {
      const w = dist < 1e-9 ? 1e9 : 1 / dist;
      totalW += w;
      wx += anchors[idx].x * w;
      wy += anchors[idx].y * w;
    }
    results.push({ path, x: wx / totalW, y: wy / totalW });
  }
  return results;
}

// src/kmeans.ts
function mulberry322(seed) {
  return () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function euclideanDist(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}
function nearestCenter(v, centers) {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let c = 0; c < centers.length; c++) {
    const d = euclideanDist(v, centers[c]);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = c;
    }
  }
  return { idx: bestIdx, dist: bestDist };
}
function kMeans(vectors, k, seed = 42) {
  const n = vectors.length;
  if (n === 0)
    return { assignments: [], centroids: [] };
  if (k >= n)
    return { assignments: vectors.map((_, i) => i), centroids: vectors.map((v) => new Float32Array(v)) };
  const rng = mulberry322(seed);
  const dim = vectors[0].length;
  const centers = [];
  centers.push(new Float32Array(vectors[Math.floor(rng() * n)]));
  for (let c = 1; c < k; c++) {
    const dists = new Float64Array(n);
    let totalDist = 0;
    for (let i = 0; i < n; i++) {
      const { dist } = nearestCenter(vectors[i], centers);
      dists[i] = dist * dist;
      totalDist += dists[i];
    }
    let r = rng() * totalDist;
    let picked = 0;
    for (let i = 0; i < n; i++) {
      r -= dists[i];
      if (r <= 0) {
        picked = i;
        break;
      }
    }
    centers.push(new Float32Array(vectors[picked]));
  }
  const assignments = new Int32Array(n);
  const MAX_ITER = 100;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      const { idx } = nearestCenter(vectors[i], centers);
      if (idx !== assignments[i]) {
        assignments[i] = idx;
        changed = true;
      }
    }
    if (!changed && iter > 0)
      break;
    const sums = [];
    const counts = new Int32Array(k);
    for (let c = 0; c < k; c++)
      sums.push(new Float64Array(dim));
    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      const vec = vectors[i];
      const sum = sums[c];
      for (let d = 0; d < dim; d++)
        sum[d] += vec[d];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] === 0)
        continue;
      const center = new Float32Array(dim);
      const sum = sums[c];
      for (let d = 0; d < dim; d++)
        center[d] = sum[d] / counts[c];
      centers[c] = center;
    }
  }
  return { assignments: Array.from(assignments), centroids: centers };
}
function computeSemanticAssignments(vectors, centroids) {
  if (centroids.length === 0)
    return vectors.map(() => ({ semA: -1, semB: -1, semW: 3 }));
  return vectors.map((v) => {
    let bestIdx = 0, bestDist = Infinity;
    let secondIdx = 0, secondDist = Infinity;
    for (let c = 0; c < centroids.length; c++) {
      const d = euclideanDist(v, centroids[c]);
      if (d < bestDist) {
        secondDist = bestDist;
        secondIdx = bestIdx;
        bestDist = d;
        bestIdx = c;
      } else if (d < secondDist) {
        secondDist = d;
        secondIdx = c;
      }
    }
    const ratio = secondDist > 0 ? bestDist / secondDist : 0;
    const semW = ratio < 0.2 ? 1 : ratio < 0.4 ? 2 : ratio < 0.6 ? 3 : ratio < 0.8 ? 4 : 5;
    return { semA: bestIdx, semB: secondIdx, semW };
  });
}

// src/view.ts
var import_obsidian6 = require("obsidian");

// src/voronoi.ts
function mulberry323(seed) {
  return () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function clipConvexPolygons(subject, clip) {
  if (subject.length < 3 || clip.length < 3)
    return [];
  let output = subject;
  for (let i = 0; i < clip.length; i++) {
    if (output.length === 0)
      return [];
    const edgeA = clip[i];
    const edgeB = clip[(i + 1) % clip.length];
    const input = output;
    output = [];
    for (let j = 0; j < input.length; j++) {
      const cur = input[j];
      const prev = input[(j + input.length - 1) % input.length];
      const curInside = isLeft(edgeA, edgeB, cur);
      const prevInside = isLeft(edgeA, edgeB, prev);
      if (curInside) {
        if (!prevInside) {
          const ix = lineIntersect(prev, cur, edgeA, edgeB);
          if (ix)
            output.push(ix);
        }
        output.push(cur);
      } else if (prevInside) {
        const ix = lineIntersect(prev, cur, edgeA, edgeB);
        if (ix)
          output.push(ix);
      }
    }
  }
  return output;
}
function isLeft(a, b, p) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= 0;
}
function lineIntersect(p1, p2, p3, p4) {
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) < 1e-12)
    return null;
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom;
  return { x: p1.x + d1x * t, y: p1.y + d1y * t };
}
function computeVoronoiCells(centroids, bounds) {
  const { minX, minY, maxX, maxY } = bounds;
  const boundRect = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY }
  ];
  const cells = [];
  for (let i = 0; i < centroids.length; i++) {
    let cell = [...boundRect];
    for (let j = 0; j < centroids.length; j++) {
      if (i === j)
        continue;
      if (cell.length < 3)
        break;
      const ci = centroids[i], cj = centroids[j];
      const mx = (ci.x + cj.x) / 2;
      const my = (ci.y + cj.y) / 2;
      const nx = ci.x - cj.x;
      const ny = ci.y - cj.y;
      const perpX = -ny, perpY = nx;
      const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
      const bigR = (maxX - minX + maxY - minY) * 2;
      const px = perpX / len, py = perpY / len;
      const nnx = nx / len, nny = ny / len;
      const halfPlane = [
        { x: mx - px * bigR, y: my - py * bigR },
        { x: mx - px * bigR + nnx * bigR, y: my - py * bigR + nny * bigR },
        { x: mx + px * bigR + nnx * bigR, y: my + py * bigR + nny * bigR },
        { x: mx + px * bigR, y: my + py * bigR }
      ];
      cell = clipConvexPolygons(cell, halfPlane);
    }
    cells.push(cell);
  }
  return cells;
}
function edgeSeed(a, b) {
  let p0 = a, p1 = b;
  if (a.x > b.x || a.x === b.x && a.y > b.y) {
    p0 = b;
    p1 = a;
  }
  const h = Math.round(p0.x * 1e5) * 73856093 ^ Math.round(p0.y * 1e5) * 19349663 ^ Math.round(p1.x * 1e5) * 83492791 ^ Math.round(p1.y * 1e5) * 45989861;
  return Math.abs(h) >>> 0;
}
function fractalDisplace(polygon, iterations, amplitude, _seed) {
  if (polygon.length < 3 || iterations <= 0)
    return polygon;
  let current = polygon;
  for (let iter = 0; iter < iterations; iter++) {
    const next = [];
    const amp = amplitude / Math.pow(2, iter);
    for (let i = 0; i < current.length; i++) {
      const a = current[i];
      const b = current[(i + 1) % current.length];
      next.push(a);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1e-10)
        continue;
      let ca = a, cb = b;
      if (a.x > b.x || a.x === b.x && a.y > b.y) {
        ca = b;
        cb = a;
      }
      const cdx = cb.x - ca.x, cdy = cb.y - ca.y;
      const px = -cdy / len, py = cdx / len;
      const rng = mulberry323(edgeSeed(a, b) + iter * 7919);
      const disp = (rng() - 0.5) * 2 * amp;
      next.push({ x: mx + px * disp, y: my + py * disp });
    }
    current = next;
  }
  return current;
}

// src/delaunay.ts
function circumcircle(px, py, i0, i1, i2) {
  const ax = px[i0], ay = py[i0];
  const bx = px[i1], by = py[i1];
  const cx = px[i2], cy = py[i2];
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-12) {
    return { cx: (ax + bx + cx) / 3, cy: (ay + by + cy) / 3, rSq: Infinity };
  }
  const aSq = ax * ax + ay * ay;
  const bSq = bx * bx + by * by;
  const cSq = cx * cx + cy * cy;
  const ux = (aSq * (by - cy) + bSq * (cy - ay) + cSq * (ay - by)) / d;
  const uy = (aSq * (cx - bx) + bSq * (ax - cx) + cSq * (bx - ax)) / d;
  const dx = ax - ux, dy = ay - uy;
  return { cx: ux, cy: uy, rSq: dx * dx + dy * dy };
}
function voronoiFromDelaunay(coords, count, bounds) {
  const n = count;
  if (n < 3) {
    const cells = [];
    const centroids = [];
    const adj = [];
    const pad = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.01 || 0.01;
    for (let i = 0; i < n; i++) {
      const x = coords[i * 2], y = coords[i * 2 + 1];
      cells.push([
        { x: x - pad, y: y - pad },
        { x: x + pad, y: y - pad },
        { x: x + pad, y: y + pad },
        { x: x - pad, y: y + pad }
      ]);
      centroids.push({ x, y });
      adj.push([]);
    }
    return { cellCount: n, cellPolygons: cells, cellCentroids: centroids, adjacency: adj };
  }
  const px = new Array(n + 3);
  const py = new Array(n + 3);
  for (let i = 0; i < n; i++) {
    px[i] = coords[i * 2];
    py[i] = coords[i * 2 + 1];
  }
  const dx = bounds.maxX - bounds.minX;
  const dy = bounds.maxY - bounds.minY;
  const dmax = Math.max(dx, dy, 1e-6);
  const midX = (bounds.minX + bounds.maxX) / 2;
  const midY = (bounds.minY + bounds.maxY) / 2;
  const margin = dmax * 20;
  px[n] = midX - margin;
  py[n] = midY - margin;
  px[n + 1] = midX + margin;
  py[n + 1] = midY - margin;
  px[n + 2] = midX;
  py[n + 2] = midY + margin;
  const triangles = [];
  {
    const cc = circumcircle(px, py, n, n + 1, n + 2);
    triangles.push({ i0: n, i1: n + 1, i2: n + 2, dead: false, cx: cc.cx, cy: cc.cy });
  }
  for (let i = 0; i < n; i++) {
    const x = px[i], y = py[i];
    const badTriangles = [];
    for (let t = 0; t < triangles.length; t++) {
      const tri = triangles[t];
      if (tri.dead)
        continue;
      const cc = circumcircle(px, py, tri.i0, tri.i1, tri.i2);
      const ddx = x - cc.cx, ddy = y - cc.cy;
      if (ddx * ddx + ddy * ddy <= cc.rSq + 1e-10) {
        badTriangles.push(t);
      }
    }
    const boundary = [];
    for (const bt of badTriangles) {
      const tri = triangles[bt];
      const edges = [
        { i0: tri.i0, i1: tri.i1 },
        { i0: tri.i1, i1: tri.i2 },
        { i0: tri.i2, i1: tri.i0 }
      ];
      for (const edge of edges) {
        let shared = false;
        for (const bt2 of badTriangles) {
          if (bt2 === bt)
            continue;
          const tri2 = triangles[bt2];
          const e2 = [
            [tri2.i0, tri2.i1],
            [tri2.i1, tri2.i2],
            [tri2.i2, tri2.i0]
          ];
          for (const [a, b] of e2) {
            if (a === edge.i1 && b === edge.i0 || a === edge.i0 && b === edge.i1) {
              shared = true;
              break;
            }
          }
          if (shared)
            break;
        }
        if (!shared)
          boundary.push(edge);
      }
    }
    for (const bt of badTriangles) {
      triangles[bt].dead = true;
    }
    for (const edge of boundary) {
      const cc = circumcircle(px, py, edge.i0, edge.i1, i);
      triangles.push({ i0: edge.i0, i1: edge.i1, i2: i, dead: false, cx: cc.cx, cy: cc.cy });
    }
  }
  const pointTriangles = new Array(n);
  for (let i = 0; i < n; i++)
    pointTriangles[i] = [];
  for (let t = 0; t < triangles.length; t++) {
    const tri = triangles[t];
    if (tri.dead)
      continue;
    if (tri.i0 < n)
      pointTriangles[tri.i0].push(t);
    if (tri.i1 < n)
      pointTriangles[tri.i1].push(t);
    if (tri.i2 < n)
      pointTriangles[tri.i2].push(t);
  }
  const cellPolygons = new Array(n);
  const cellCentroids = new Array(n);
  const adjacencySet = new Array(n);
  for (let i = 0; i < n; i++)
    adjacencySet[i] = /* @__PURE__ */ new Set();
  for (let i = 0; i < n; i++) {
    const tris = pointTriangles[i];
    if (tris.length === 0) {
      cellPolygons[i] = [];
      cellCentroids[i] = { x: px[i], y: py[i] };
      continue;
    }
    const ordered = orderTrianglesAroundPoint(i, tris, triangles);
    const poly = [];
    for (const t of ordered) {
      const tri = triangles[t];
      let cx2 = tri.cx, cy2 = tri.cy;
      cx2 = Math.max(bounds.minX, Math.min(bounds.maxX, cx2));
      cy2 = Math.max(bounds.minY, Math.min(bounds.maxY, cy2));
      poly.push({ x: cx2, y: cy2 });
    }
    const deduped = [];
    for (let j = 0; j < poly.length; j++) {
      const prev = j > 0 ? deduped[deduped.length - 1] : poly[poly.length - 1];
      const p = poly[j];
      if (deduped.length === 0 || Math.abs(p.x - prev.x) > 1e-10 || Math.abs(p.y - prev.y) > 1e-10) {
        deduped.push(p);
      }
    }
    cellPolygons[i] = deduped;
    let cx = 0, cy = 0;
    for (const p of deduped) {
      cx += p.x;
      cy += p.y;
    }
    if (deduped.length > 0) {
      cx /= deduped.length;
      cy /= deduped.length;
    } else {
      cx = px[i];
      cy = py[i];
    }
    cellCentroids[i] = { x: cx, y: cy };
    for (const t of ordered) {
      const tri = triangles[t];
      const verts = [tri.i0, tri.i1, tri.i2];
      for (const v of verts) {
        if (v !== i && v < n) {
          adjacencySet[i].add(v);
        }
      }
    }
  }
  const adjacency = new Array(n);
  for (let i = 0; i < n; i++)
    adjacency[i] = [...adjacencySet[i]];
  return { cellCount: n, cellPolygons, cellCentroids, adjacency };
}
function orderTrianglesAroundPoint(pointIdx, triIndices, triangles) {
  if (triIndices.length <= 1)
    return triIndices;
  const px = 0, py = 0;
  const angles = triIndices.map((t) => {
    const tri = triangles[t];
    return { idx: t, angle: 0 };
  });
  let refX = 0, refY = 0;
  {
    const t0 = triangles[triIndices[0]];
    const verts = [t0.i0, t0.i1, t0.i2];
  }
  const tri0 = triangles[triIndices[0]];
  let ptX = 0, ptY = 0;
  let meanX = 0, meanY = 0;
  for (const t of triIndices) {
    meanX += triangles[t].cx;
    meanY += triangles[t].cy;
  }
  meanX /= triIndices.length;
  meanY /= triIndices.length;
  for (let i = 0; i < angles.length; i++) {
    const tri = triangles[angles[i].idx];
    angles[i].angle = Math.atan2(tri.cy - meanY, tri.cx - meanX);
  }
  angles.sort((a, b) => a.angle - b.angle);
  return angles.map((a) => a.idx);
}

// src/noise.ts
function mulberry324(seed) {
  return () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function buildPermTable(seed) {
  const size = 512;
  const perm = new Uint16Array(size);
  const rng = mulberry324(seed);
  for (let i = 0; i < 256; i++)
    perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = rng() * (i + 1) | 0;
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }
  for (let i = 0; i < 256; i++)
    perm[i + 256] = perm[i];
  return perm;
}
function buildGradTable(seed) {
  const rng = mulberry324(seed ^ 305419896);
  const grads = new Float64Array(256);
  for (let i = 0; i < 256; i++)
    grads[i] = rng() * 2 - 1;
  return grads;
}
function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function valueNoise2D(x, y, perm, grads) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = smootherstep(xf);
  const v = smootherstep(yf);
  const ix = xi & 255;
  const iy = yi & 255;
  const v00 = grads[perm[perm[ix] + iy] & 255];
  const v10 = grads[perm[perm[ix + 1 & 255] + iy] & 255];
  const v01 = grads[perm[perm[ix] + (iy + 1 & 255)] & 255];
  const v11 = grads[perm[perm[ix + 1 & 255] + (iy + 1 & 255)] & 255];
  const a = v00 + u * (v10 - v00);
  const b = v01 + u * (v11 - v01);
  return a + v * (b - a);
}
function fbm2D(x, y, octaves, lacunarity, persistence, perm, grads) {
  let value = 0;
  let amp = 1;
  let freq = 1;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise2D(x * freq, y * freq, perm, grads);
    maxAmp += amp;
    amp *= persistence;
    freq *= lacunarity;
  }
  return value / maxAmp;
}
function domainWarp(x, y, amplitude, frequency, perm1, grads1, perm2, grads2) {
  const wx = fbm2D(x * frequency, y * frequency, 4, 2, 0.5, perm1, grads1);
  const wy = fbm2D(x * frequency + 7.31, y * frequency + 3.77, 4, 2, 0.5, perm2, grads2);
  return {
    x: x + amplitude * wx,
    y: y + amplitude * wy
  };
}
function createNoiseContext(seed) {
  return {
    perm1: buildPermTable(seed),
    grads1: buildGradTable(seed),
    perm2: buildPermTable(seed ^ 3735928559),
    grads2: buildGradTable(seed ^ 3405691582)
  };
}

// src/worldmap.ts
function mulberry325(seed) {
  return () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
function convexHull(points) {
  if (points.length <= 2)
    return [...points];
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const n = sorted.length;
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = n - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
var SEM_PALETTE = [
  "#00D6FF",
  "#B9FF00",
  "#FF7A00",
  "#A855F7",
  "#00FFB3",
  "#FF3DB8",
  "#00FFA3",
  "#FFD400",
  "#00F5D4",
  "#FF9A3D",
  "#7CFFCB",
  "#B8C0FF"
];
function autoLabel(points) {
  const counts = /* @__PURE__ */ new Map();
  for (const p of points) {
    const key = p.cat || p.folder || "Notes";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let best = "Zone";
  let bestCount = 0;
  for (const [k, v] of counts) {
    if (v > bestCount) {
      bestCount = v;
      best = k;
    }
  }
  return best;
}
function hashPoints(dataPoints) {
  let h = 0;
  for (const p of dataPoints) {
    h = h * 31 + (p.x * 1e5 | 0) | 0;
    h = h * 31 + (p.y * 1e5 | 0) | 0;
  }
  return Math.abs(h) >>> 0;
}
function generateMesh(dataPoints, dataBounds, meshDensity) {
  const seed = hashPoints(dataPoints);
  const rng = mulberry325(seed);
  const rangeX = dataBounds.maxX - dataBounds.minX || 0.01;
  const rangeY = dataBounds.maxY - dataBounds.minY || 0.01;
  const expand = 0.3;
  const meshBounds = {
    minX: dataBounds.minX - rangeX * expand,
    minY: dataBounds.minY - rangeY * expand,
    maxX: dataBounds.maxX + rangeX * expand,
    maxY: dataBounds.maxY + rangeY * expand
  };
  const mRangeX = meshBounds.maxX - meshBounds.minX;
  const mRangeY = meshBounds.maxY - meshBounds.minY;
  const aspect = mRangeX / mRangeY;
  const ny = Math.round(Math.sqrt(meshDensity / aspect));
  const nx = Math.round(ny * aspect);
  const cellW = mRangeX / nx;
  const cellH = mRangeY / ny;
  const jitter = 0.4;
  const gridPoints = [];
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const bx = meshBounds.minX + (ix + 0.5) * cellW;
      const by = meshBounds.minY + (iy + 0.5) * cellH;
      const jx = (rng() - 0.5) * 2 * jitter * cellW;
      const jy = (rng() - 0.5) * 2 * jitter * cellH;
      gridPoints.push(bx + jx, by + jy);
    }
  }
  const sentinelStart = gridPoints.length / 2;
  const sentinelDist = Math.max(rangeX, rangeY) * 3;
  const cxData = (dataBounds.minX + dataBounds.maxX) / 2;
  const cyData = (dataBounds.minY + dataBounds.maxY) / 2;
  for (let i = 0; i < 16; i++) {
    const angle = i / 16 * Math.PI * 2;
    gridPoints.push(
      cxData + Math.cos(angle) * sentinelDist,
      cyData + Math.sin(angle) * sentinelDist
    );
  }
  const fullBounds = {
    minX: meshBounds.minX - sentinelDist,
    minY: meshBounds.minY - sentinelDist,
    maxX: meshBounds.maxX + sentinelDist,
    maxY: meshBounds.maxY + sentinelDist
  };
  const coords = new Float64Array(gridPoints);
  const totalCount = gridPoints.length / 2;
  const mesh = voronoiFromDelaunay(coords, totalCount, fullBounds);
  return { mesh, sentinelStart, meshBounds };
}
function assignTerrainAndCountries(mesh, dataPoints, noteClusterIds, sentinelStart, noiseCtx, dataBounds, wmSettings) {
  const n = mesh.cellCount;
  const isLand = new Array(n);
  const cellAssignments = new Array(n);
  const rangeX = dataBounds.maxX - dataBounds.minX || 0.01;
  const rangeY = dataBounds.maxY - dataBounds.minY || 0.01;
  const dataRange = Math.max(rangeX, rangeY);
  const unity = wmSettings?.unity ?? 0.07;
  const landThreshold = wmSettings?.seaLevel ?? 0.2;
  const ruggedness = wmSettings?.ruggedness ?? 0.4;
  const sigma = dataRange * unity;
  const invSigma2 = -1 / (sigma * sigma);
  const cutoffSq = sigma * 3 * (sigma * 3);
  const warpAmplitude = sigma * ruggedness;
  const warpFrequency = 3 / dataRange;
  let maxObservedHeat = 1e-4;
  for (let i = 0; i < sentinelStart && i < n; i += 15) {
    let d = 0;
    const c = mesh.cellCentroids[i];
    for (let j = 0; j < dataPoints.length; j++) {
      const dx = c.x - dataPoints[j].x;
      const dy = c.y - dataPoints[j].y;
      const dSq = dx * dx + dy * dy;
      if (dSq < cutoffSq)
        d += Math.exp(dSq * invSigma2);
    }
    if (d > maxObservedHeat)
      maxObservedHeat = d;
  }
  const effectiveThreshold = maxObservedHeat * landThreshold;
  for (let i = 0; i < n; i++) {
    if (i >= sentinelStart) {
      isLand[i] = false;
      cellAssignments[i] = -1;
      continue;
    }
    const c = mesh.cellCentroids[i];
    const warped = domainWarp(
      c.x,
      c.y,
      warpAmplitude,
      warpFrequency,
      noiseCtx.perm1,
      noiseCtx.grads1,
      noiseCtx.perm2,
      noiseCtx.grads2
    );
    let totalDensity = 0;
    const clusterHeat = {};
    for (let j = 0; j < dataPoints.length; j++) {
      const dx = warped.x - dataPoints[j].x;
      const dy = warped.y - dataPoints[j].y;
      const dSq = dx * dx + dy * dy;
      if (dSq > cutoffSq)
        continue;
      const heat = Math.exp(dSq * invSigma2);
      const cid = noteClusterIds[j];
      totalDensity += heat;
      clusterHeat[cid] = (clusterHeat[cid] || 0) + heat;
    }
    if (totalDensity >= effectiveThreshold) {
      isLand[i] = true;
      let maxHeat = 0;
      let winner = -1;
      for (const id in clusterHeat) {
        if (clusterHeat[id] > maxHeat) {
          maxHeat = clusterHeat[id];
          winner = Number(id);
        }
      }
      cellAssignments[i] = winner;
    } else {
      isLand[i] = false;
      cellAssignments[i] = -1;
    }
  }
  return { isLand, cellAssignments };
}
function healDisconnected(mesh, assignments, isLand) {
  const n = mesh.cellCount;
  const clusterIds = /* @__PURE__ */ new Set();
  for (let i = 0; i < n; i++) {
    if (assignments[i] >= 0)
      clusterIds.add(assignments[i]);
  }
  for (const clusterId of clusterIds) {
    const cells = [];
    for (let i = 0; i < n; i++) {
      if (assignments[i] === clusterId)
        cells.push(i);
    }
    if (cells.length <= 1)
      continue;
    const cellSet = new Set(cells);
    const visited = /* @__PURE__ */ new Set();
    const components = [];
    for (const start of cells) {
      if (visited.has(start))
        continue;
      const component = [];
      const queue = [start];
      visited.add(start);
      while (queue.length > 0) {
        const cur = queue.pop();
        component.push(cur);
        for (const nb of mesh.adjacency[cur]) {
          if (!visited.has(nb) && cellSet.has(nb)) {
            visited.add(nb);
            queue.push(nb);
          }
        }
      }
      components.push(component);
    }
    if (components.length <= 1)
      continue;
    let maxSize = 0, maxIdx = 0;
    for (let i = 0; i < components.length; i++) {
      if (components[i].length > maxSize) {
        maxSize = components[i].length;
        maxIdx = i;
      }
    }
    for (let i = 0; i < components.length; i++) {
      if (i === maxIdx)
        continue;
      const orphan = components[i];
      let touchesOcean = false;
      for (const cell of orphan) {
        for (const nb of mesh.adjacency[cell]) {
          if (!isLand[nb]) {
            touchesOcean = true;
            break;
          }
        }
        if (touchesOcean)
          break;
      }
      if (touchesOcean)
        continue;
      const neighborCounts = /* @__PURE__ */ new Map();
      for (const cell of orphan) {
        for (const nb of mesh.adjacency[cell]) {
          const nba = assignments[nb];
          if (nba >= 0 && nba !== clusterId) {
            neighborCounts.set(nba, (neighborCounts.get(nba) || 0) + 1);
          }
        }
      }
      let bestNeighbor = -1, bestCount = 0;
      for (const [nId, count] of neighborCounts) {
        if (count > bestCount) {
          bestCount = count;
          bestNeighbor = nId;
        }
      }
      if (bestNeighbor >= 0) {
        for (const cell of orphan)
          assignments[cell] = bestNeighbor;
      }
    }
  }
}
function vKey(p) {
  return `${Math.round(p.x * 1e6)}_${Math.round(p.y * 1e6)}`;
}
function findSharedEdge(polyA, polyB) {
  const eps = 1e-8;
  const sharedVerts = [];
  for (const a of polyA) {
    for (const b of polyB) {
      if (Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps) {
        let dup = false;
        for (const s of sharedVerts) {
          if (Math.abs(s.x - a.x) < eps && Math.abs(s.y - a.y) < eps) {
            dup = true;
            break;
          }
        }
        if (!dup)
          sharedVerts.push(a);
      }
    }
  }
  if (sharedVerts.length >= 2) {
    return { v0: sharedVerts[0], v1: sharedVerts[1] };
  }
  return null;
}
function extractBorderSegments(mesh, assignments, subDomains) {
  const n = mesh.cellCount;
  const segments = [];
  const visited = /* @__PURE__ */ new Set();
  for (let i = 0; i < n; i++) {
    for (const j of mesh.adjacency[i]) {
      if (j <= i)
        continue;
      const domI = assignments[i];
      const domJ = assignments[j];
      const subI = subDomains[i];
      const subJ = subDomains[j];
      let edgeType = null;
      if (domI === -1 || domJ === -1) {
        if (domI !== domJ)
          edgeType = "coast";
      } else if (domI !== domJ) {
        edgeType = "border";
      } else if (subI !== subJ && subI >= 0 && subJ >= 0) {
        edgeType = "province";
      }
      if (!edgeType)
        continue;
      const key = `${Math.min(i, j)}_${Math.max(i, j)}`;
      if (visited.has(key))
        continue;
      visited.add(key);
      const shared = findSharedEdge(mesh.cellPolygons[i], mesh.cellPolygons[j]);
      if (shared) {
        segments.push({
          v0: shared.v0,
          v1: shared.v1,
          leftZone: domI,
          rightZone: domJ,
          edgeType
        });
      }
    }
  }
  return segments;
}
function chainSegments(segs) {
  if (segs.length === 0)
    return [];
  const vertSegs = /* @__PURE__ */ new Map();
  for (let i = 0; i < segs.length; i++) {
    const k0 = vKey(segs[i].v0);
    const k1 = vKey(segs[i].v1);
    if (!vertSegs.has(k0))
      vertSegs.set(k0, []);
    if (!vertSegs.has(k1))
      vertSegs.set(k1, []);
    vertSegs.get(k0).push({ segIdx: i, otherEnd: segs[i].v1 });
    vertSegs.get(k1).push({ segIdx: i, otherEnd: segs[i].v0 });
  }
  const usedSegs = /* @__PURE__ */ new Set();
  const chains = [];
  for (let startSeg = 0; startSeg < segs.length; startSeg++) {
    if (usedSegs.has(startSeg))
      continue;
    const chain = [segs[startSeg].v0, segs[startSeg].v1];
    usedSegs.add(startSeg);
    let done = false;
    while (!done) {
      done = true;
      const lastKey = vKey(chain[chain.length - 1]);
      const candidates = vertSegs.get(lastKey);
      if (candidates) {
        for (const c of candidates) {
          if (!usedSegs.has(c.segIdx)) {
            usedSegs.add(c.segIdx);
            chain.push(c.otherEnd);
            done = false;
            break;
          }
        }
      }
    }
    done = false;
    while (!done) {
      done = true;
      const firstKey = vKey(chain[0]);
      const candidates = vertSegs.get(firstKey);
      if (candidates) {
        for (const c of candidates) {
          if (!usedSegs.has(c.segIdx)) {
            usedSegs.add(c.segIdx);
            chain.unshift(c.otherEnd);
            done = false;
            break;
          }
        }
      }
    }
    chains.push(chain);
  }
  return chains;
}
function fractalDisplaceEdge(pts, iterations, amplitude, seed) {
  if (pts.length < 2 || iterations <= 0)
    return pts;
  let current = pts;
  for (let iter = 0; iter < iterations; iter++) {
    const next = [];
    const amp = amplitude / Math.pow(2, iter);
    for (let i = 0; i < current.length - 1; i++) {
      const a = current[i];
      const b = current[i + 1];
      next.push(a);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1e-10)
        continue;
      const px = -dy / len, py = dx / len;
      let p0 = a, p1 = b;
      if (a.x > b.x || a.x === b.x && a.y > b.y) {
        p0 = b;
        p1 = a;
      }
      const edgeHash = (Math.round(p0.x * 1e5) * 73856093 ^ Math.round(p0.y * 1e5) * 19349663 ^ Math.round(p1.x * 1e5) * 83492791 ^ Math.round(p1.y * 1e5) * 45989861) >>> 0;
      const rng = mulberry325(edgeHash + iter * 7919);
      const disp = (rng() - 0.5) * 2 * amp;
      next.push({ x: mx + px * disp, y: my + py * disp });
    }
    next.push(current[current.length - 1]);
    current = next;
  }
  return current;
}
function chaikinSubdivideOpen(pts, iterations) {
  if (pts.length < 3)
    return pts;
  let current = pts;
  for (let iter = 0; iter < iterations; iter++) {
    const next = [];
    next.push(current[0]);
    for (let i = 0; i < current.length - 1; i++) {
      const a = current[i];
      const b = current[i + 1];
      if (i > 0) {
        next.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      }
      if (i < current.length - 2) {
        next.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
      }
    }
    next.push(current[current.length - 1]);
    current = next;
  }
  return current;
}
function chaikinSubdivideClosed(pts, iterations) {
  if (pts.length < 3)
    return pts;
  let current = pts;
  for (let iter = 0; iter < iterations; iter++) {
    const next = [];
    const n = current.length;
    for (let i = 0; i < n; i++) {
      const a = current[i];
      const b = current[(i + 1) % n];
      next.push(
        { x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 },
        { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 }
      );
    }
    current = next;
  }
  return current;
}
function buildBorderEdges(segments, dataRange) {
  const pairMap = /* @__PURE__ */ new Map();
  for (const seg of segments) {
    const left = Math.min(seg.leftZone, seg.rightZone);
    const right = Math.max(seg.leftZone, seg.rightZone);
    const key = `${left}_${right}_${seg.edgeType}`;
    if (!pairMap.has(key))
      pairMap.set(key, []);
    pairMap.get(key).push(seg);
  }
  const borderEdges = [];
  const amplitude = dataRange * 8e-3;
  for (const [_key, segs] of pairMap) {
    if (segs.length === 0)
      continue;
    const edgeType = segs[0].edgeType;
    const chains = chainSegments(segs);
    for (const chain of chains) {
      if (chain.length < 2)
        continue;
      const seed = (Math.round(chain[0].x * 1e5) * 73856093 ^ Math.round(chain[0].y * 1e5) * 19349663 ^ Math.round(chain[chain.length - 1].x * 1e5) * 83492791 ^ Math.round(chain[chain.length - 1].y * 1e5) * 45989861) >>> 0;
      const amp = edgeType === "province" ? amplitude * 0.6 : amplitude;
      let pts = fractalDisplaceEdge(chain, 3, amp, seed);
      pts = chaikinSubdivideOpen(pts, 2);
      borderEdges.push({
        vertices: pts,
        leftZone: Math.min(segs[0].leftZone, segs[0].rightZone),
        rightZone: Math.max(segs[0].leftZone, segs[0].rightZone),
        edgeType
      });
    }
  }
  return borderEdges;
}
function extractCoastline(mesh, landCells) {
  const eps = 1e-6;
  const boundaryEdges = [];
  for (const cellIdx of landCells) {
    const poly = mesh.cellPolygons[cellIdx];
    if (!poly || poly.length < 3)
      continue;
    for (let i = 0; i < poly.length; i++) {
      const v0 = poly[i];
      const v1 = poly[(i + 1) % poly.length];
      let isInternal = false;
      for (const nb of mesh.adjacency[cellIdx]) {
        if (landCells.has(nb)) {
          const nbPoly = mesh.cellPolygons[nb];
          if (nbPoly && sharesEdge(v0, v1, nbPoly, eps)) {
            isInternal = true;
            break;
          }
        }
      }
      if (!isInternal) {
        boundaryEdges.push({ v0, v1 });
      }
    }
  }
  if (boundaryEdges.length === 0)
    return [];
  const fromV1 = /* @__PURE__ */ new Map();
  for (let i = 0; i < boundaryEdges.length; i++) {
    const key = vKey(boundaryEdges[i].v1);
    if (!fromV1.has(key))
      fromV1.set(key, []);
    fromV1.get(key).push({ ...boundaryEdges[i], idx: i });
  }
  const used = /* @__PURE__ */ new Set();
  const result = [];
  const start = boundaryEdges[0];
  result.push(start.v0);
  used.add(0);
  let current = start.v1;
  result.push(current);
  for (let step = 0; step < boundaryEdges.length; step++) {
    const key = vKey(current);
    const candidates = fromV1.get(key);
    if (!candidates)
      break;
    let found = false;
    for (const c of candidates) {
      if (!used.has(c.idx)) {
      }
    }
    if (!found)
      break;
  }
  const fromV0 = /* @__PURE__ */ new Map();
  for (let i = 0; i < boundaryEdges.length; i++) {
    const key = vKey(boundaryEdges[i].v0);
    if (!fromV0.has(key))
      fromV0.set(key, []);
    fromV0.get(key).push({ ...boundaryEdges[i], idx: i });
  }
  const result2 = [];
  const used2 = /* @__PURE__ */ new Set();
  result2.push(boundaryEdges[0].v0);
  used2.add(0);
  let cur = boundaryEdges[0].v1;
  result2.push(cur);
  for (let step = 0; step < boundaryEdges.length; step++) {
    const key = vKey(cur);
    const candidates = fromV0.get(key);
    if (!candidates)
      break;
    let found = false;
    for (const c of candidates) {
      if (!used2.has(c.idx)) {
        used2.add(c.idx);
        cur = c.v1;
        result2.push(cur);
        found = true;
        break;
      }
    }
    if (!found)
      break;
  }
  return result2;
}
function sharesEdge(v0, v1, poly, eps) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    if (Math.abs(v0.x - a.x) < eps && Math.abs(v0.y - a.y) < eps && Math.abs(v1.x - b.x) < eps && Math.abs(v1.y - b.y) < eps || Math.abs(v0.x - b.x) < eps && Math.abs(v0.y - b.y) < eps && Math.abs(v1.x - a.x) < eps && Math.abs(v1.y - a.y) < eps) {
      return true;
    }
  }
  return false;
}
function assembleResult(mesh, assignments, isLand, subDomains, clusterIds, memberPathsByCluster, borderEdges, dataRange) {
  const zones = [];
  for (const clusterId of clusterIds) {
    const members = memberPathsByCluster.get(clusterId);
    if (!members || members.length === 0)
      continue;
    const cellPolys = [];
    const allVerts = [];
    const subDomainCellsMap = /* @__PURE__ */ new Map();
    for (let i = 0; i < mesh.cellCount; i++) {
      if (assignments[i] === clusterId) {
        const poly = mesh.cellPolygons[i];
        if (poly && poly.length >= 3) {
          cellPolys.push(poly);
          for (const v of poly)
            allVerts.push(v);
          const sub = subDomains[i];
          if (!subDomainCellsMap.has(sub))
            subDomainCellsMap.set(sub, []);
          subDomainCellsMap.get(sub).push(poly);
        }
      }
    }
    if (cellPolys.length === 0)
      continue;
    const hull = convexHull(allVerts);
    const blob = hull;
    zones.push({
      id: clusterId,
      label: autoLabel(members),
      color: SEM_PALETTE[clusterId % SEM_PALETTE.length],
      memberPaths: members.map((m) => m.path),
      hull,
      blob,
      cellPolygons: cellPolys,
      subDomainCells: subDomainCellsMap
    });
  }
  const clusterAdj = /* @__PURE__ */ new Map();
  for (const id of clusterIds)
    clusterAdj.set(id, /* @__PURE__ */ new Set());
  for (const edge of borderEdges) {
    if (edge.leftZone >= 0 && edge.rightZone >= 0) {
      clusterAdj.get(edge.leftZone)?.add(edge.rightZone);
      clusterAdj.get(edge.rightZone)?.add(edge.leftZone);
    }
  }
  const clusterVisited = /* @__PURE__ */ new Set();
  const continents = [];
  let continentId = 0;
  for (const clusterId of clusterIds) {
    if (clusterVisited.has(clusterId))
      continue;
    const component = [];
    const queue = [clusterId];
    clusterVisited.add(clusterId);
    while (queue.length > 0) {
      const cur = queue.pop();
      component.push(cur);
      const neighbors = clusterAdj.get(cur);
      if (neighbors) {
        for (const nb of neighbors) {
          if (!clusterVisited.has(nb)) {
            clusterVisited.add(nb);
            queue.push(nb);
          }
        }
      }
    }
    const continentLandCells = /* @__PURE__ */ new Set();
    for (let i = 0; i < mesh.cellCount; i++) {
      if (component.includes(assignments[i])) {
        continentLandCells.add(i);
      }
    }
    let coastline = extractCoastline(mesh, continentLandCells);
    if (coastline.length >= 3) {
      const amplitude = dataRange * 0.01;
      const seed = (Math.round(coastline[0].x * 1e5) * 73856093 ^ Math.round(coastline[0].y * 1e5) * 19349663) >>> 0;
      coastline = fractalDisplaceEdge(coastline, 3, amplitude, seed);
      coastline = chaikinSubdivideClosed(coastline, 2);
    }
    const allMembers = [];
    for (const cId of component) {
      const m = memberPathsByCluster.get(cId);
      if (m)
        allMembers.push(...m);
    }
    const label = autoLabel(allMembers);
    continents.push({
      id: continentId++,
      zoneIds: component,
      label,
      coastline
    });
  }
  return { zones, continents, borderEdges };
}
function assignSubDomains(mesh, assignments, subCentroidsByCluster) {
  const n = mesh.cellCount;
  const subDomains = new Array(n).fill(-1);
  for (let i = 0; i < n; i++) {
    const dom = assignments[i];
    if (dom < 0)
      continue;
    const centroids = subCentroidsByCluster.get(dom);
    if (!centroids || centroids.length === 0) {
      subDomains[i] = 0;
      continue;
    }
    const c = mesh.cellCentroids[i];
    let bestDist = Infinity;
    let bestSub = 0;
    for (let s = 0; s < centroids.length; s++) {
      const dx = c.x - centroids[s].x;
      const dy = c.y - centroids[s].y;
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        bestSub = s;
      }
    }
    subDomains[i] = bestSub;
  }
  return subDomains;
}
function runWorldMapPipeline(dataPoints, clusterAssignments, k, subCentroidsByCluster, wmSettings) {
  const groups = /* @__PURE__ */ new Map();
  for (let i = 0; i < dataPoints.length; i++) {
    const c = clusterAssignments[i];
    if (!groups.has(c))
      groups.set(c, []);
    groups.get(c).push(dataPoints[i]);
  }
  const clusterIds = [];
  for (const [id, members] of groups) {
    if (members.length < 2)
      continue;
    clusterIds.push(id);
  }
  if (clusterIds.length === 0) {
    return { zones: [], continents: [], borderEdges: [] };
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of dataPoints) {
    if (p.x < minX)
      minX = p.x;
    if (p.x > maxX)
      maxX = p.x;
    if (p.y < minY)
      minY = p.y;
    if (p.y > maxY)
      maxY = p.y;
  }
  const dataBounds = { minX, minY, maxX, maxY };
  const rangeX = maxX - minX || 0.01;
  const rangeY = maxY - minY || 0.01;
  const dataRange = Math.max(rangeX, rangeY);
  const seed = hashPoints(dataPoints.map((p) => ({ x: p.x, y: p.y })));
  const meshDensity = Math.min(4e3, Math.max(1e3, dataPoints.length * 2));
  const { mesh, sentinelStart } = generateMesh(
    dataPoints.map((p) => ({ x: p.x, y: p.y })),
    dataBounds,
    meshDensity
  );
  const noteClusterIds = [];
  for (let i = 0; i < dataPoints.length; i++) {
    noteClusterIds.push(clusterAssignments[i]);
  }
  const terrainNoise = createNoiseContext(seed);
  const { isLand, cellAssignments } = assignTerrainAndCountries(
    mesh,
    dataPoints.map((p) => ({ x: p.x, y: p.y })),
    noteClusterIds,
    sentinelStart,
    terrainNoise,
    dataBounds,
    wmSettings
  );
  healDisconnected(mesh, cellAssignments, isLand);
  const subDomains = subCentroidsByCluster ? assignSubDomains(mesh, cellAssignments, subCentroidsByCluster) : new Array(mesh.cellCount).fill(0);
  const segments = extractBorderSegments(mesh, cellAssignments, subDomains);
  const borderEdges = buildBorderEdges(segments, dataRange);
  const memberPathsByCluster = /* @__PURE__ */ new Map();
  for (const [id, members] of groups) {
    if (members.length >= 2)
      memberPathsByCluster.set(id, members);
  }
  return assembleResult(
    mesh,
    cellAssignments,
    isLand,
    subDomains,
    clusterIds,
    memberPathsByCluster,
    borderEdges,
    dataRange
  );
}

// src/zones.ts
var SEM_PALETTE2 = [
  "#00D6FF",
  "#B9FF00",
  "#FF7A00",
  "#A855F7",
  "#00FFB3",
  "#FF3DB8",
  "#00FFA3",
  "#FFD400",
  "#00F5D4",
  "#FF9A3D",
  "#7CFFCB",
  "#B8C0FF"
];
function cross2(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
function convexHull2(points) {
  if (points.length <= 2)
    return [...points];
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const n = sorted.length;
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross2(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = n - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross2(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
function scaleHull(hull, factor) {
  if (hull.length < 2)
    return hull;
  let cx = 0, cy = 0;
  for (const p of hull) {
    cx += p.x;
    cy += p.y;
  }
  cx /= hull.length;
  cy /= hull.length;
  return hull.map((p) => ({
    x: cx + (p.x - cx) * factor,
    y: cy + (p.y - cy) * factor
  }));
}
function chaikinSubdivide(pts, iterations) {
  if (pts.length < 3)
    return pts;
  let current = pts;
  for (let iter = 0; iter < iterations; iter++) {
    const next = [];
    const n = current.length;
    for (let i = 0; i < n; i++) {
      const a = current[i];
      const b = current[(i + 1) % n];
      next.push(
        { x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 },
        { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 }
      );
    }
    current = next;
  }
  return current;
}
function autoLabel2(points) {
  const counts = /* @__PURE__ */ new Map();
  for (const p of points) {
    const key = p.cat || p.folder || "Notes";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let best = "Zone";
  let bestCount = 0;
  for (const [k, v] of counts) {
    if (v > bestCount) {
      bestCount = v;
      best = k;
    }
  }
  return best;
}
function computeZones(points, assignments, k) {
  const groups = /* @__PURE__ */ new Map();
  for (let i = 0; i < points.length; i++) {
    const c = assignments[i];
    if (!groups.has(c))
      groups.set(c, []);
    groups.get(c).push(points[i]);
  }
  const zones = [];
  for (const [id, members] of groups) {
    if (members.length < 2)
      continue;
    const pts2d = members.map((m) => ({ x: m.x, y: m.y }));
    let hull = convexHull2(pts2d);
    if (hull.length < 3) {
      const cx = (pts2d[0].x + (pts2d[1]?.x ?? pts2d[0].x)) / 2;
      const cy = (pts2d[0].y + (pts2d[1]?.y ?? pts2d[0].y)) / 2;
      const dx = Math.abs((pts2d[1]?.x ?? pts2d[0].x) - pts2d[0].x);
      const dy = Math.abs((pts2d[1]?.y ?? pts2d[0].y) - pts2d[0].y);
      const pad = Math.max(0.03, Math.max(dx, dy) * 0.4);
      hull = [
        { x: cx - pad, y: cy },
        { x: cx, y: cy + pad },
        { x: cx + pad, y: cy },
        { x: cx, y: cy - pad }
      ];
    }
    const scaled = scaleHull(hull, 1.3);
    const blob = chaikinSubdivide(scaled, 3);
    zones.push({
      id,
      label: autoLabel2(members),
      color: SEM_PALETTE2[id % SEM_PALETTE2.length],
      memberPaths: members.map((m) => m.path),
      hull: scaled,
      blob
    });
  }
  return zones;
}
function computeWorldMapZones(points, assignments, k, subCentroidsByCluster, wmSettings) {
  return runWorldMapPipeline(points, assignments, k, subCentroidsByCluster, wmSettings);
}
function computeWorldMapSubZones(parentHull, points, assignments, localK) {
  const groups = /* @__PURE__ */ new Map();
  for (let i = 0; i < points.length; i++) {
    const c = assignments[i];
    if (!groups.has(c))
      groups.set(c, []);
    groups.get(c).push(points[i]);
  }
  const clusterIds = [...groups.keys()].sort((a, b) => a - b);
  const centroids = [];
  const centroidIdMap = [];
  for (const id of clusterIds) {
    const members = groups.get(id);
    if (members.length < 2)
      continue;
    let cx = 0, cy = 0;
    for (const m of members) {
      cx += m.x;
      cy += m.y;
    }
    centroids.push({ x: cx / members.length, y: cy / members.length });
    centroidIdMap.push(id);
  }
  if (centroids.length === 0 || parentHull.length < 3)
    return [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of parentHull) {
    if (p.x < minX)
      minX = p.x;
    if (p.x > maxX)
      maxX = p.x;
    if (p.y < minY)
      minY = p.y;
    if (p.y > maxY)
      maxY = p.y;
  }
  const padVal = Math.max(maxX - minX, maxY - minY) * 0.1;
  const bounds = {
    minX: minX - padVal,
    minY: minY - padVal,
    maxX: maxX + padVal,
    maxY: maxY + padVal
  };
  const voronoiCells = computeVoronoiCells(centroids, bounds);
  const range = Math.max(maxX - minX, maxY - minY) || 0.01;
  const amplitude = range * 0.05;
  const expandedHull = scaleHull(parentHull, 1.4);
  const zones = [];
  for (let ci = 0; ci < centroids.length; ci++) {
    const id = centroidIdMap[ci];
    const members = groups.get(id);
    const voronoiCell = voronoiCells[ci];
    if (!voronoiCell || voronoiCell.length < 3)
      continue;
    const clipped = clipConvexPolygons(voronoiCell, expandedHull);
    if (clipped.length < 3)
      continue;
    const blob = fractalDisplace(clipped, 4, amplitude);
    zones.push({
      id,
      label: autoLabel2(members),
      color: SEM_PALETTE2[id % SEM_PALETTE2.length],
      memberPaths: members.map((m) => m.path),
      hull: clipped,
      blob
    });
  }
  return zones;
}
function drawItalicText(ctx, text, x, y, fillStyle, size) {
  ctx.save();
  ctx.font = `${size}px var(--font-interface)`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = fillStyle;
  ctx.translate(x, y);
  ctx.transform(1, 0, -0.21, 1, 0, 0);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16 & 255;
  const g = n >> 8 & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
function drawZone(ctx, zone, w2s, alpha, dashed = false, worldmap = false, skipLabel = false, parentColor, fillFade = 1) {
  const blob = zone.blob;
  if (blob.length < 3)
    return;
  const screenPts = blob.map((p) => w2s(p.x, p.y));
  const isSubZone = !!parentColor;
  const color = parentColor || zone.color;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(screenPts[0].x, screenPts[0].y);
  for (let i = 1; i < screenPts.length; i++) {
    ctx.lineTo(screenPts[i].x, screenPts[i].y);
  }
  ctx.closePath();
  if (isSubZone) {
    const fillAlpha = worldmap ? 0.12 : 0.1;
    ctx.fillStyle = hexToRgba(color, fillAlpha * alpha);
    ctx.fill();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = hexToRgba(color, 0.25 * alpha);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    const fillAlpha = worldmap ? 0.12 : 0.1;
    if (fillFade > 0.01) {
      ctx.fillStyle = hexToRgba(color, fillAlpha * alpha * fillFade);
      ctx.fill();
    }
    if (dashed)
      ctx.setLineDash([6, 4]);
    const shadowBlur = worldmap ? 4 : 6;
    ctx.shadowColor = hexToRgba(color, 0.3 * alpha);
    ctx.shadowBlur = shadowBlur;
    ctx.strokeStyle = hexToRgba(color, 0.35 * alpha);
    ctx.lineWidth = worldmap ? 2 : 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (dashed)
      ctx.setLineDash([]);
  }
  if (!skipLabel) {
    const cx = screenPts.reduce((s, p) => s + p.x, 0) / screenPts.length;
    const cy = screenPts.reduce((s, p) => s + p.y, 0) / screenPts.length;
    if (isSubZone) {
      drawItalicText(ctx, zone.label, cx, cy, hexToRgba(color, 0.4 * alpha), 7);
    } else {
      ctx.font = "600 9px var(--font-interface)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "1.5px";
      ctx.fillStyle = hexToRgba(color, 0.5 * alpha);
      ctx.fillText(zone.label.toUpperCase(), cx, cy);
      ctx.letterSpacing = "0px";
    }
  }
  ctx.restore();
}

// src/zoneNaming.ts
var import_obsidian5 = require("obsidian");
async function generateZoneNames(clusters, apiKey, model = "gpt-4o-mini") {
  const result = /* @__PURE__ */ new Map();
  if (!apiKey || clusters.length === 0)
    return result;
  const clusterDescs = clusters.map((c) => {
    const sample = c.titles.slice(0, 15).join(", ");
    return `Cluster ${c.idx}: ${sample}`;
  }).join("\n");
  try {
    const resp = await (0, import_obsidian5.requestUrl)({
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are naming regions on a knowledge map. For each cluster of note titles, produce a short evocative name (2-4 words) that captures the thematic essence. Respond with one name per line in the format: CLUSTER_NUM: Name"
          },
          {
            role: "user",
            content: `Name each knowledge region:

${clusterDescs}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    if (resp.status !== 200)
      return result;
    const text = resp.json?.choices?.[0]?.message?.content || "";
    for (const line of text.split("\n")) {
      const match = line.match(/(\d+)\s*:\s*(.+)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const name = match[2].trim();
        if (name)
          result.set(idx, name);
      }
    }
  } catch {
  }
  return result;
}

// src/view.ts
var VIEW_TYPE = "chorographia-map";
var FOLDER_COLORS = [
  "#8E9AAF",
  "#C9963B",
  "#B28DFF",
  "#5AC6CE",
  "#B8541A",
  "#9AB2AF",
  "#BCDC2B",
  "#FF7A00",
  "#A855F7",
  "#00D6FF",
  "#00FFB3",
  "#FF3DB8"
];
var SEM_PALETTE3 = [
  "#00D6FF",
  "#B9FF00",
  "#FF7A00",
  "#A855F7",
  "#00FFB3",
  "#FF3DB8",
  "#00FFA3",
  "#FFD400",
  "#00F5D4",
  "#FF9A3D",
  "#7CFFCB",
  "#B8C0FF"
];
var SEM_SPLIT = { 1: 0.8, 2: 0.65, 3: 0.5, 4: 0.35, 5: 0.2 };
var TYPE_COLORS = {
  SRC: "#8E9AAF",
  LIT: "#C9963B",
  SEED: "#B8541A",
  EVE: "#B28DFF",
  REV: "#9AB2AF",
  NOTE: "#5AC6CE"
};
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}
function lerpColor(c1, c2, t) {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  return rgbToHex(
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t)
  );
}
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (h << 5) - h + s.charCodeAt(i) | 0;
  return Math.abs(h);
}
var DARK = {
  panelBg: "rgba(15,15,26,0.92)",
  panelBorder: "rgba(44,44,58,0.6)",
  text: "#D6D6E0",
  textMuted: "#8E9AAF",
  linkStroke: "rgba(214,214,224,0.18)"
};
var LIGHT = {
  panelBg: "rgba(255,255,255,0.92)",
  panelBorder: "rgba(160,160,180,0.4)",
  text: "#1e1e2e",
  textMuted: "#6e6e80",
  linkStroke: "rgba(60,60,80,0.22)"
};
var ChorographiaView = class extends import_obsidian6.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.dpr = 1;
    // state
    this.allPoints = [];
    this.points = [];
    this.zones = [];
    this.continents = [];
    this.borderEdges = [];
    this.subZonesMap = /* @__PURE__ */ new Map();
    // globalZoneId → sub-zones (global coords)
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.hoverIdx = -1;
    this.selectedIdx = -1;
    // animation
    this.animating = false;
    this.animStartTime = 0;
    this.animDuration = 800;
    this.animStartPanX = 0;
    this.animStartPanY = 0;
    this.animTargetPanX = 0;
    this.animTargetPanY = 0;
    this.animFrameId = 0;
    // drag
    this.dragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragPanX = 0;
    this.dragPanY = 0;
    // color maps
    this.folderColorMap = /* @__PURE__ */ new Map();
    this.catColorMap = /* @__PURE__ */ new Map();
    this.plugin = plugin;
  }
  get theme() {
    return document.body.classList.contains("theme-light") ? LIGHT : DARK;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Chorographia Map";
  }
  getIcon() {
    return "map";
  }
  // ===================== lifecycle =====================
  async onOpen() {
    const root = this.containerEl.children[1];
    root.empty();
    root.addClass("chorographia-container");
    root.style.overflow = "hidden";
    this.containerEl.style.overflow = "hidden";
    this.canvas = root.createEl("canvas", { cls: "chorographia-canvas" });
    this.statusEl = root.createEl("div", { cls: "chorographia-status" });
    this.buildControls(root);
    this.dpr = window.devicePixelRatio || 1;
    this.setupInteractions();
    this.loadPoints();
    this.resizeCanvas();
    this.draw();
    this.registerEvent(this.app.workspace.on("resize", () => {
      this.resizeCanvas();
      this.draw();
    }));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => {
      this.syncActiveNoteSelection();
    }));
    this.syncActiveNoteSelection();
  }
  async onClose() {
    cancelAnimationFrame(this.animFrameId);
  }
  // ===================== controls =====================
  buildControls(root) {
    this.menuBtn = root.createEl("button", { cls: "chorographia-menu-btn", attr: { "aria-label": "Map settings" } });
    this.menuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
    this.menuPanel = root.createEl("div", { cls: "chorographia-menu" });
    const colorRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
    colorRow.createEl("span", { text: "Color" });
    this.colorModeSelect = colorRow.createEl("select");
    for (const [v, t] of [
      ["semantic", "Semantic"],
      ["folder", "Folder"],
      ["type", "Type"],
      ["cat", "Category"]
    ])
      this.colorModeSelect.createEl("option", { text: t, value: v });
    this.colorModeSelect.value = this.plugin.settings.colorMode;
    this.colorModeSelect.addEventListener("change", async () => {
      this.plugin.settings.colorMode = this.colorModeSelect.value;
      await this.plugin.saveSettings();
      this.draw();
    });
    const linksRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
    const linksLbl = linksRow.createEl("label", { cls: "chorographia-toggle-label" });
    this.linksToggle = linksLbl.createEl("input", { type: "checkbox" });
    this.linksToggle.checked = this.plugin.settings.showLinks;
    linksLbl.appendText(" Links");
    this.linksToggle.addEventListener("change", async () => {
      this.plugin.settings.showLinks = this.linksToggle.checked;
      await this.plugin.saveSettings();
      this.draw();
    });
    const zonesRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
    const zonesLbl = zonesRow.createEl("label", { cls: "chorographia-toggle-label" });
    this.zonesToggle = zonesLbl.createEl("input", { type: "checkbox" });
    this.zonesToggle.checked = this.plugin.settings.showZones;
    zonesLbl.appendText(" Zones");
    this.zonesToggle.addEventListener("change", async () => {
      this.plugin.settings.showZones = this.zonesToggle.checked;
      await this.plugin.saveSettings();
      this.draw();
    });
    const subZonesRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
    const subZonesLbl = subZonesRow.createEl("label", { cls: "chorographia-toggle-label" });
    this.subZonesToggle = subZonesLbl.createEl("input", { type: "checkbox" });
    this.subZonesToggle.checked = this.plugin.settings.showSubZones;
    subZonesLbl.appendText(" Sub-zones");
    this.subZonesToggle.addEventListener("change", async () => {
      this.plugin.settings.showSubZones = this.subZonesToggle.checked;
      await this.plugin.saveSettings();
      this.draw();
    });
    const titlesRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
    const titlesLbl = titlesRow.createEl("label", { cls: "chorographia-toggle-label" });
    this.titlesToggle = titlesLbl.createEl("input", { type: "checkbox" });
    this.titlesToggle.checked = this.plugin.settings.showNoteTitles;
    titlesLbl.appendText(" Titles");
    this.titlesToggle.addEventListener("change", async () => {
      this.plugin.settings.showNoteTitles = this.titlesToggle.checked;
      await this.plugin.saveSettings();
      this.draw();
    });
    const minimapRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
    minimapRow.createEl("span", { text: "Minimap" });
    this.minimapSelect = minimapRow.createEl("select");
    for (const [v, t] of [
      ["off", "Off"],
      ["top-left", "TL"],
      ["top-right", "TR"],
      ["bottom-left", "BL"],
      ["bottom-right", "BR"]
    ])
      this.minimapSelect.createEl("option", { text: t, value: v });
    this.minimapSelect.value = this.plugin.settings.minimapCorner;
    this.minimapSelect.addEventListener("change", async () => {
      this.plugin.settings.minimapCorner = this.minimapSelect.value;
      await this.plugin.saveSettings();
      this.draw();
    });
    this.menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.menuPanel.classList.toggle("is-open");
    });
    this.canvas.addEventListener("mousedown", () => {
      this.menuPanel.classList.remove("is-open");
    }, true);
  }
  // ===================== data =====================
  async loadPoints() {
    const pts = [];
    const folders = /* @__PURE__ */ new Set();
    const cats = /* @__PURE__ */ new Set();
    for (const [path, n] of Object.entries(this.plugin.cache.notes)) {
      if (n.x == null || n.y == null)
        continue;
      const p = {
        path,
        x: n.x,
        y: n.y,
        title: n.title,
        folder: n.folder,
        semA: n.semA ?? -1,
        semB: n.semB ?? -1,
        semW: n.semW ?? 3,
        noteType: n.noteType || "",
        cat: n.cat || "",
        links: n.links || []
      };
      pts.push(p);
      folders.add(p.folder);
      if (p.cat)
        cats.add(p.cat);
    }
    [...folders].sort().forEach((f, i) => this.folderColorMap.set(f, FOLDER_COLORS[i % FOLDER_COLORS.length]));
    [...cats].sort().forEach((c, i) => this.catColorMap.set(c, FOLDER_COLORS[i % FOLDER_COLORS.length]));
    this.allPoints = pts;
    this.points = pts;
    this.hoverIdx = -1;
    this.selectedIdx = -1;
    this.updateStatus();
    try {
      await this.computeAndCacheZones();
    } catch (e) {
      console.error("Chorographia: zone computation failed", e);
    }
    this.draw();
  }
  async computeAndCacheZones() {
    const k = this.plugin.settings.zoneGranularity;
    const model = this.plugin.embeddingModelString;
    const s = this.plugin.settings;
    const cacheKey = s.zoneStyle === "worldmap" ? `${k}_${model}_worldmap_${s.worldmapSeaLevel}_${s.worldmapUnity}_${s.worldmapRuggedness}` : `${k}_${model}_${s.zoneStyle}`;
    const isWorldmap = this.plugin.settings.zoneStyle === "worldmap";
    const cached = this.plugin.cache.zones?.[cacheKey];
    if (cached && cached.subAssignments) {
      const assignments2 = [];
      const pointsForZones2 = [];
      for (const p of this.allPoints) {
        if (cached.assignments[p.path] != null) {
          assignments2.push(cached.assignments[p.path]);
          pointsForZones2.push(p);
        }
      }
      if (pointsForZones2.length > 0) {
        if (isWorldmap) {
          const subCentroidsByCluster2 = /* @__PURE__ */ new Map();
          if (cached.subAssignments) {
            for (const zoneIdStr of Object.keys(cached.subAssignments)) {
              const zoneId = Number(zoneIdStr);
              const subAssign = cached.subAssignments[zoneId];
              if (!subAssign)
                continue;
              const subGroups = /* @__PURE__ */ new Map();
              for (const p of this.allPoints) {
                if (subAssign[p.path] != null) {
                  const s2 = subAssign[p.path];
                  if (!subGroups.has(s2))
                    subGroups.set(s2, []);
                  subGroups.get(s2).push({ x: p.x, y: p.y });
                }
              }
              const subCentroids = [];
              for (const [_, pts] of [...subGroups].sort((a, b) => a[0] - b[0])) {
                let cx = 0, cy = 0;
                for (const p of pts) {
                  cx += p.x;
                  cy += p.y;
                }
                subCentroids.push({ x: cx / pts.length, y: cy / pts.length });
              }
              subCentroidsByCluster2.set(zoneId, subCentroids);
            }
          }
          const wmSettings = {
            seaLevel: this.plugin.settings.worldmapSeaLevel,
            unity: this.plugin.settings.worldmapUnity,
            ruggedness: this.plugin.settings.worldmapRuggedness
          };
          const result = computeWorldMapZones(pointsForZones2, assignments2, k, subCentroidsByCluster2, wmSettings);
          this.zones = result.zones;
          this.continents = result.continents;
          this.borderEdges = result.borderEdges;
        } else {
          this.zones = computeZones(pointsForZones2, assignments2, k);
          this.continents = [];
          this.borderEdges = [];
        }
        for (const zone of this.zones) {
          if (cached.labels[zone.id])
            zone.label = cached.labels[zone.id];
        }
        this.subZonesMap.clear();
        if (cached.subAssignments) {
          for (const zone of this.zones) {
            const subAssign = cached.subAssignments[zone.id];
            if (!subAssign)
              continue;
            const subPts = [];
            const subIdx = [];
            for (const p of this.allPoints) {
              if (subAssign[p.path] != null) {
                subPts.push(p);
                subIdx.push(subAssign[p.path]);
              }
            }
            if (subPts.length > 0) {
              const localK2 = Math.max(2, Math.round(k / 4));
              const subZones = isWorldmap ? computeWorldMapSubZones(zone.hull, subPts, subIdx, localK2) : computeZones(subPts, subIdx, localK2);
              const subLabels = cached.subLabels?.[zone.id];
              if (subLabels) {
                for (const sz of subZones) {
                  if (subLabels[sz.id])
                    sz.label = subLabels[sz.id];
                }
              }
              this.subZonesMap.set(zone.id, subZones);
            }
          }
        }
        if (cached.centroids && cached.centroids.length > 0) {
          const cachedCentroids = cached.centroids.map((c) => decodeFloat32(c));
          const vecs = [];
          const vecPaths = [];
          for (const p of this.allPoints) {
            const note = this.plugin.cache.notes[p.path];
            if (note?.embedding) {
              vecs.push(decodeFloat32(note.embedding));
              vecPaths.push(p.path);
            }
          }
          if (vecs.length > 0) {
            const semAssign = computeSemanticAssignments(vecs, cachedCentroids);
            for (let i = 0; i < vecPaths.length; i++) {
              const note = this.plugin.cache.notes[vecPaths[i]];
              if (note) {
                note.semA = semAssign[i].semA;
                note.semB = semAssign[i].semB;
                note.semW = semAssign[i].semW;
              }
            }
          }
        }
        return;
      }
    }
    const paths = [];
    const vectors = [];
    for (const p of this.allPoints) {
      const note = this.plugin.cache.notes[p.path];
      if (note?.embedding) {
        paths.push(p.path);
        vectors.push(decodeFloat32(note.embedding));
      }
    }
    if (vectors.length < k) {
      this.zones = [];
      this.subZonesMap.clear();
      return;
    }
    let assignments;
    let centroids;
    const locked = this.plugin.settings.mapLocked;
    const lockedCentroids = this.plugin.cache.lockedCentroids;
    if (locked && lockedCentroids && lockedCentroids.length > 0) {
      centroids = lockedCentroids.map((c) => decodeFloat32(c));
      assignments = vectors.map((v) => {
        let bestIdx = 0, bestDist = Infinity;
        for (let c = 0; c < centroids.length; c++) {
          let sum = 0;
          for (let d = 0; d < v.length; d++) {
            const diff = v[d] - centroids[c][d];
            sum += diff * diff;
          }
          const dist = Math.sqrt(sum);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = c;
          }
        }
        return bestIdx;
      });
    } else {
      const result = kMeans(vectors, k);
      assignments = result.assignments;
      centroids = result.centroids;
    }
    const assignMap = {};
    for (let i = 0; i < paths.length; i++) {
      assignMap[paths[i]] = assignments[i];
    }
    const pointAssignments = [];
    const pointsForZones = [];
    for (const p of this.allPoints) {
      if (assignMap[p.path] != null) {
        pointAssignments.push(assignMap[p.path]);
        pointsForZones.push(p);
      }
    }
    const vecByPath = /* @__PURE__ */ new Map();
    for (let i = 0; i < paths.length; i++)
      vecByPath.set(paths[i], vectors[i]);
    const localK = Math.max(2, Math.round(k / 4));
    const subAssignmentsCache = {};
    const subLabelsCache = {};
    const clusterMembers = /* @__PURE__ */ new Map();
    for (let i = 0; i < paths.length; i++) {
      const c = assignments[i];
      if (!clusterMembers.has(c))
        clusterMembers.set(c, []);
      const pt = this.allPoints.find((p) => p.path === paths[i]);
      if (pt)
        clusterMembers.get(c).push({ path: paths[i], vec: vectors[i], x: pt.x, y: pt.y });
    }
    const subCentroidsByCluster = /* @__PURE__ */ new Map();
    for (const [clusterId, members] of clusterMembers) {
      if (members.length < localK)
        continue;
      const { assignments: subAssignments } = kMeans(members.map((m) => m.vec), localK);
      const subAssignMap = {};
      for (let i = 0; i < members.length; i++)
        subAssignMap[members[i].path] = subAssignments[i];
      subAssignmentsCache[clusterId] = subAssignMap;
      const subGroups = /* @__PURE__ */ new Map();
      for (let i = 0; i < members.length; i++) {
        const s2 = subAssignments[i];
        if (!subGroups.has(s2))
          subGroups.set(s2, []);
        subGroups.get(s2).push({ x: members[i].x, y: members[i].y });
      }
      const subCentroids = [];
      for (const [_, pts] of [...subGroups].sort((a, b) => a[0] - b[0])) {
        let cx = 0, cy = 0;
        for (const p of pts) {
          cx += p.x;
          cy += p.y;
        }
        subCentroids.push({ x: cx / pts.length, y: cy / pts.length });
      }
      subCentroidsByCluster.set(clusterId, subCentroids);
    }
    if (isWorldmap) {
      const wmSettings = {
        seaLevel: this.plugin.settings.worldmapSeaLevel,
        unity: this.plugin.settings.worldmapUnity,
        ruggedness: this.plugin.settings.worldmapRuggedness
      };
      const result = computeWorldMapZones(pointsForZones, pointAssignments, k, subCentroidsByCluster, wmSettings);
      this.zones = result.zones;
      this.continents = result.continents;
      this.borderEdges = result.borderEdges;
    } else {
      this.zones = computeZones(pointsForZones, pointAssignments, k);
      this.continents = [];
      this.borderEdges = [];
    }
    const labelMap = {};
    for (const z of this.zones)
      labelMap[z.id] = z.label;
    const skipLLMNaming = locked && this.plugin.cache.lockedLabels && Object.keys(this.plugin.cache.lockedLabels).length > 0;
    if (this.plugin.settings.enableLLMZoneNaming && !skipLLMNaming) {
      try {
        const clusters = this.zones.map((z) => ({
          idx: z.id,
          titles: z.memberPaths.map((p) => {
            const note = this.plugin.cache.notes[p];
            return note?.title || p.split("/").pop() || p;
          })
        }));
        let llmNames = /* @__PURE__ */ new Map();
        if (this.plugin.settings.llmProvider === "ollama") {
          llmNames = await generateZoneNamesOllama(clusters, this.plugin.settings.ollamaUrl, this.plugin.settings.ollamaLlmModel);
        } else if (this.plugin.settings.llmProvider === "openai" && this.plugin.settings.openaiApiKey) {
          llmNames = await generateZoneNames(clusters, this.plugin.settings.openaiApiKey);
        } else if (this.plugin.settings.llmProvider === "openrouter" && this.plugin.settings.openrouterApiKey) {
          llmNames = await generateZoneNamesOpenRouter(clusters, this.plugin.settings.openrouterApiKey, this.plugin.settings.openrouterLlmModel);
        }
        for (const [idx, name] of llmNames) {
          labelMap[idx] = name;
          const zone = this.zones.find((z) => z.id === idx);
          if (zone)
            zone.label = name;
        }
      } catch (e) {
        console.error("Chorographia: LLM zone naming failed", e);
      }
    }
    const allSubClusters = [];
    this.subZonesMap.clear();
    for (const zone of this.zones) {
      const subAssignMap = subAssignmentsCache[zone.id];
      if (!subAssignMap)
        continue;
      const subPts = [];
      const subIdx = [];
      for (const p of this.allPoints) {
        if (subAssignMap[p.path] != null) {
          subPts.push({ path: p.path, x: p.x, y: p.y, folder: p.folder, cat: p.cat });
          subIdx.push(subAssignMap[p.path]);
        }
      }
      if (subPts.length === 0)
        continue;
      const subZones = isWorldmap ? computeWorldMapSubZones(zone.hull, subPts, subIdx, localK) : computeZones(subPts, subIdx, localK);
      const subLabelMap = {};
      for (const sz of subZones)
        subLabelMap[sz.id] = sz.label;
      for (const sz of subZones) {
        allSubClusters.push({
          zoneId: zone.id,
          idx: sz.id,
          titles: sz.memberPaths.map((p) => {
            const note = this.plugin.cache.notes[p];
            return note?.title || p.split("/").pop() || p;
          })
        });
      }
      subLabelsCache[zone.id] = subLabelMap;
      this.subZonesMap.set(zone.id, subZones);
    }
    if (this.plugin.settings.enableLLMZoneNaming && !skipLLMNaming && allSubClusters.length > 0) {
      try {
        const batchClusters = allSubClusters.map((c, i) => ({
          idx: i,
          titles: c.titles
        }));
        let llmNames = /* @__PURE__ */ new Map();
        if (this.plugin.settings.llmProvider === "ollama") {
          llmNames = await generateZoneNamesOllama(batchClusters, this.plugin.settings.ollamaUrl, this.plugin.settings.ollamaLlmModel);
        } else if (this.plugin.settings.llmProvider === "openai" && this.plugin.settings.openaiApiKey) {
          llmNames = await generateZoneNames(batchClusters, this.plugin.settings.openaiApiKey);
        } else if (this.plugin.settings.llmProvider === "openrouter" && this.plugin.settings.openrouterApiKey) {
          llmNames = await generateZoneNamesOpenRouter(batchClusters, this.plugin.settings.openrouterApiKey, this.plugin.settings.openrouterLlmModel);
        }
        for (const [batchIdx, name] of llmNames) {
          const c = allSubClusters[batchIdx];
          subLabelsCache[c.zoneId][c.idx] = name;
          const subZones = this.subZonesMap.get(c.zoneId);
          const sz = subZones?.find((z) => z.id === c.idx);
          if (sz)
            sz.label = name;
        }
      } catch (e) {
        console.error("Chorographia: LLM sub-zone naming failed", e);
      }
    }
    if (locked && this.plugin.cache.lockedLabels) {
      for (const zone of this.zones) {
        const lockedLabel = this.plugin.cache.lockedLabels[zone.id];
        if (lockedLabel) {
          zone.label = lockedLabel;
          labelMap[zone.id] = lockedLabel;
        }
      }
    }
    if (locked && this.plugin.cache.lockedSubLabels) {
      for (const [zoneId, subZones] of this.subZonesMap) {
        const lockedSubs = this.plugin.cache.lockedSubLabels[zoneId];
        if (!lockedSubs)
          continue;
        for (const sz of subZones) {
          const lockedLabel = lockedSubs[sz.id];
          if (lockedLabel) {
            sz.label = lockedLabel;
            subLabelsCache[zoneId][sz.id] = lockedLabel;
          }
        }
      }
    }
    if (!this.plugin.cache.zones)
      this.plugin.cache.zones = {};
    this.plugin.cache.zones[cacheKey] = {
      k,
      model,
      assignments: assignMap,
      labels: labelMap,
      llmEnhanced: this.plugin.settings.enableLLMZoneNaming,
      centroids: centroids.map((c) => encodeFloat32(c)),
      subAssignments: subAssignmentsCache,
      subLabels: subLabelsCache
    };
    await this.plugin.saveCache();
  }
  // ===================== animation =====================
  animateTo(worldX, worldY) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const s = Math.min(w, h) * 0.42 * this.zoom;
    this.animStartPanX = this.panX;
    this.animStartPanY = this.panY;
    this.animTargetPanX = -worldX * s;
    this.animTargetPanY = worldY * s;
    this.animStartTime = performance.now();
    this.animating = true;
    this.animFrameId = requestAnimationFrame((now) => this.animTick(now));
  }
  animTick(now) {
    if (!this.animating)
      return;
    let t = (now - this.animStartTime) / this.animDuration;
    if (t >= 1) {
      t = 1;
      this.animating = false;
    }
    const ease = 1 - Math.pow(1 - t, 3);
    this.panX = this.animStartPanX + (this.animTargetPanX - this.animStartPanX) * ease;
    this.panY = this.animStartPanY + (this.animTargetPanY - this.animStartPanY) * ease;
    this.draw();
    if (this.animating) {
      this.animFrameId = requestAnimationFrame((now2) => this.animTick(now2));
    }
  }
  cancelAnimation() {
    if (this.animating) {
      this.animating = false;
      cancelAnimationFrame(this.animFrameId);
    }
  }
  // ===================== coordinate transforms =====================
  resizeCanvas() {
    const p = this.canvas.parentElement;
    const w = p.clientWidth, h = p.clientHeight;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx = this.canvas.getContext("2d");
    this.ctx.scale(this.dpr, this.dpr);
  }
  w2s(wx, wy) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const s = Math.min(w, h) * 0.42 * this.zoom;
    return { x: w / 2 + this.panX + wx * s, y: h / 2 + this.panY - wy * s };
  }
  s2w(sx, sy) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const s = Math.min(w, h) * 0.42 * this.zoom;
    return { x: (sx - w / 2 - this.panX) / s, y: -(sy - h / 2 - this.panY) / s };
  }
  // ===================== coloring =====================
  color(p) {
    switch (this.plugin.settings.colorMode) {
      case "semantic":
        return this.semColor(p);
      case "folder":
        return this.folderColorMap.get(p.folder) || FOLDER_COLORS[0];
      case "type": {
        const t = p.noteType.toUpperCase();
        return TYPE_COLORS[t] || FOLDER_COLORS[hashStr(p.noteType) % FOLDER_COLORS.length];
      }
      case "cat":
        return p.cat ? this.catColorMap.get(p.cat) || FOLDER_COLORS[0] : FOLDER_COLORS[0];
      default:
        return FOLDER_COLORS[0];
    }
  }
  semColor(p) {
    if (p.semA < 0)
      return this.folderColorMap.get(p.folder) || FOLDER_COLORS[0];
    const cA = SEM_PALETTE3[p.semA % SEM_PALETTE3.length];
    if (p.semB < 0 || p.semA === p.semB)
      return cA;
    return lerpColor(cA, SEM_PALETTE3[p.semB % SEM_PALETTE3.length], 1 - (SEM_SPLIT[p.semW] ?? 0.5));
  }
  // ===================== draw =====================
  draw() {
    const ctx = this.ctx;
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    ctx.clearRect(0, 0, W, H);
    const pts = this.points;
    const th = this.theme;
    if (!pts.length) {
      ctx.fillStyle = th.textMuted;
      ctx.font = "15px var(--font-interface)";
      ctx.textAlign = "center";
      ctx.fillText("No points. Run re-embed + recompute layout in settings.", W / 2, H / 2);
      return;
    }
    const showLinks = this.plugin.settings.showLinks;
    const isSem = this.plugin.settings.colorMode === "semantic";
    const zoom = this.zoom;
    const idx = /* @__PURE__ */ new Map();
    pts.forEach((p, i) => idx.set(p.path, i));
    const scr = pts.map((p) => this.w2s(p.x, p.y));
    if (this.plugin.settings.showZones && this.zones.length > 0) {
      const w2sFn = (wx, wy) => this.w2s(wx, wy);
      const isWorldmap = this.plugin.settings.zoneStyle === "worldmap";
      const isDarkTheme = document.body.classList.contains("theme-dark");
      let subAlpha = Math.max(0, Math.min(1, (zoom - 2) / 3));
      if (!this.plugin.settings.showSubZones)
        subAlpha = 0;
      const globalZoneAlpha = 1 - subAlpha * 0.3;
      const parentFillFade = 1 - subAlpha;
      if (isWorldmap && this.continents.length > 0) {
        ctx.fillStyle = isDarkTheme ? "#0a0e1a" : "#e8eef5";
        ctx.fillRect(0, 0, W, H);
        const zoneById = /* @__PURE__ */ new Map();
        for (const zone of this.zones)
          zoneById.set(zone.id, zone);
        for (const continent of this.continents) {
          const memberZones = continent.zoneIds.map((id) => zoneById.get(id)).filter((z) => !!z);
          if (memberZones.length === 0)
            continue;
          if (continent.coastline && continent.coastline.length >= 3) {
            const coastScreen = continent.coastline.map((p) => w2sFn(p.x, p.y));
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(coastScreen[0].x, coastScreen[0].y);
            for (let ci = 1; ci < coastScreen.length; ci++) {
              ctx.lineTo(coastScreen[ci].x, coastScreen[ci].y);
            }
            ctx.closePath();
            ctx.clip();
            for (const zone of memberZones) {
              if (!zone.cellPolygons || zone.cellPolygons.length === 0)
                continue;
              if (subAlpha > 0.01 && zone.subDomainCells && zone.subDomainCells.size > 1) {
                const subIds = [...zone.subDomainCells.keys()].sort((a, b) => a - b);
                for (let si = 0; si < subIds.length; si++) {
                  const t = subIds.length > 1 ? si / (subIds.length - 1) : 0;
                  const targetShade = t < 0.5 ? lerpColor(zone.color, "#000000", t * 0.8) : lerpColor(zone.color, "#FFFFFF", (t - 0.5) * 1);
                  const shade = lerpColor(zone.color, targetShade, subAlpha);
                  const rgb = hexToRgb(shade);
                  const parentAlpha = 0.12 * globalZoneAlpha * parentFillFade;
                  const subFillAlpha = 0.22 * globalZoneAlpha * subAlpha;
                  const blendedAlpha = parentAlpha + subFillAlpha;
                  ctx.fillStyle = `rgba(${rgb.join(",")},${blendedAlpha})`;
                  for (const cell of zone.subDomainCells.get(subIds[si])) {
                    if (cell.length < 3)
                      continue;
                    ctx.beginPath();
                    const s0 = w2sFn(cell[0].x, cell[0].y);
                    ctx.moveTo(s0.x, s0.y);
                    for (let vi = 1; vi < cell.length; vi++) {
                      const sv = w2sFn(cell[vi].x, cell[vi].y);
                      ctx.lineTo(sv.x, sv.y);
                    }
                    ctx.closePath();
                    ctx.fill();
                  }
                }
              } else {
                const fillAlpha = 0.12 * globalZoneAlpha;
                ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${fillAlpha})`;
                for (const cell of zone.cellPolygons) {
                  if (cell.length < 3)
                    continue;
                  ctx.beginPath();
                  const s0 = w2sFn(cell[0].x, cell[0].y);
                  ctx.moveTo(s0.x, s0.y);
                  for (let vi = 1; vi < cell.length; vi++) {
                    const sv = w2sFn(cell[vi].x, cell[vi].y);
                    ctx.lineTo(sv.x, sv.y);
                  }
                  ctx.closePath();
                  ctx.fill();
                }
              }
            }
            const provinceAlpha = 0.2;
            const continentZoneSet = new Set(continent.zoneIds);
            if (provinceAlpha > 0.01) {
              const provColor = isDarkTheme ? `rgba(200,220,255,${provinceAlpha})` : `rgba(40,60,100,${provinceAlpha})`;
              ctx.setLineDash([3, 4]);
              ctx.strokeStyle = provColor;
              ctx.lineWidth = 0.8;
              for (const edge of this.borderEdges) {
                if (edge.edgeType !== "province")
                  continue;
                if (!continentZoneSet.has(edge.leftZone) && !continentZoneSet.has(edge.rightZone))
                  continue;
                const edgeScreen = edge.vertices.map((p) => w2sFn(p.x, p.y));
                if (edgeScreen.length < 2)
                  continue;
                ctx.beginPath();
                ctx.moveTo(edgeScreen[0].x, edgeScreen[0].y);
                for (let ei = 1; ei < edgeScreen.length; ei++)
                  ctx.lineTo(edgeScreen[ei].x, edgeScreen[ei].y);
                ctx.stroke();
              }
              ctx.setLineDash([]);
            }
            const borderColor = isDarkTheme ? "rgba(200,220,255,0.2)" : "rgba(40,60,100,0.2)";
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            for (const edge of this.borderEdges) {
              if (edge.edgeType !== "border")
                continue;
              if (!continentZoneSet.has(edge.leftZone) && !continentZoneSet.has(edge.rightZone))
                continue;
              const edgeScreen = edge.vertices.map((p) => w2sFn(p.x, p.y));
              if (edgeScreen.length < 2)
                continue;
              ctx.beginPath();
              ctx.moveTo(edgeScreen[0].x, edgeScreen[0].y);
              for (let ei = 1; ei < edgeScreen.length; ei++)
                ctx.lineTo(edgeScreen[ei].x, edgeScreen[ei].y);
              ctx.stroke();
            }
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(coastScreen[0].x, coastScreen[0].y);
            for (let ci = 1; ci < coastScreen.length; ci++) {
              ctx.lineTo(coastScreen[ci].x, coastScreen[ci].y);
            }
            ctx.closePath();
            const coastColor = isDarkTheme ? "rgba(200,220,255,0.35)" : "rgba(40,60,100,0.35)";
            ctx.shadowColor = coastColor;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = coastColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();
          } else {
            for (const zone of memberZones) {
              if (zone.cellPolygons) {
                const fillAlpha = 0.12 * globalZoneAlpha;
                ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${fillAlpha})`;
                for (const cell of zone.cellPolygons) {
                  if (cell.length < 3)
                    continue;
                  ctx.beginPath();
                  const s0 = w2sFn(cell[0].x, cell[0].y);
                  ctx.moveTo(s0.x, s0.y);
                  for (let vi = 1; vi < cell.length; vi++) {
                    const sv = w2sFn(cell[vi].x, cell[vi].y);
                    ctx.lineTo(sv.x, sv.y);
                  }
                  ctx.closePath();
                  ctx.fill();
                }
              }
            }
          }
        }
        for (const zone of this.zones) {
          if (!zone.cellPolygons || zone.cellPolygons.length === 0)
            continue;
          let cx = 0, cy = 0, count = 0;
          for (const cell of zone.cellPolygons) {
            for (const v of cell) {
              cx += v.x;
              cy += v.y;
              count++;
            }
          }
          if (count === 0)
            continue;
          cx /= count;
          cy /= count;
          const spt = w2sFn(cx, cy);
          ctx.save();
          ctx.font = "600 9px var(--font-interface)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.letterSpacing = "1.5px";
          ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${0.5 * globalZoneAlpha})`;
          ctx.fillText(zone.label.toUpperCase(), spt.x, spt.y);
          ctx.letterSpacing = "0px";
          ctx.restore();
        }
        if (subAlpha > 0.01) {
          for (const zone of this.zones) {
            if (!zone.subDomainCells || zone.subDomainCells.size <= 1)
              continue;
            const subZones = this.subZonesMap.get(zone.id);
            if (!subZones)
              continue;
            const subIds = [...zone.subDomainCells.keys()].sort((a, b) => a - b);
            for (let si = 0; si < subIds.length; si++) {
              const cells = zone.subDomainCells.get(subIds[si]);
              if (!cells || cells.length === 0)
                continue;
              const sz = subZones[si];
              if (!sz)
                continue;
              let cx = 0, cy = 0, count = 0;
              for (const cell of cells) {
                for (const v of cell) {
                  cx += v.x;
                  cy += v.y;
                  count++;
                }
              }
              if (count === 0)
                continue;
              cx /= count;
              cy /= count;
              const spt = w2sFn(cx, cy);
              ctx.save();
              ctx.font = "7px var(--font-interface)";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${0.4 * subAlpha})`;
              ctx.translate(spt.x, spt.y);
              ctx.transform(1, 0, -0.21, 1, 0, 0);
              ctx.fillText(sz.label, 0, 0);
              ctx.restore();
            }
          }
        }
        const continentLabelAlpha = Math.max(0, 1 - (zoom - 1) / 2);
        if (continentLabelAlpha > 0.01) {
          for (const continent of this.continents) {
            if (continent.zoneIds.length <= 1)
              continue;
            const memberZones = continent.zoneIds.map((id) => zoneById.get(id)).filter((z) => !!z);
            if (memberZones.length <= 1)
              continue;
            let cx = 0, cy = 0;
            for (const z of memberZones) {
              const blobCx = z.blob.reduce((s, p) => s + p.x, 0) / z.blob.length;
              const blobCy = z.blob.reduce((s, p) => s + p.y, 0) / z.blob.length;
              cx += blobCx;
              cy += blobCy;
            }
            cx /= memberZones.length;
            cy /= memberZones.length;
            const spt = w2sFn(cx, cy);
            ctx.save();
            ctx.globalAlpha = continentLabelAlpha;
            ctx.font = "bold 14px var(--font-interface)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.letterSpacing = "3px";
            ctx.fillStyle = isDarkTheme ? "rgba(200,220,255,0.4)" : "rgba(40,60,100,0.4)";
            ctx.fillText(continent.label.toUpperCase(), spt.x, spt.y - 20);
            ctx.letterSpacing = "0px";
            ctx.restore();
          }
        }
      } else {
        for (const zone of this.zones) {
          drawZone(ctx, zone, w2sFn, globalZoneAlpha, false, isWorldmap, false, void 0, parentFillFade);
        }
        if (subAlpha > 0.01) {
          for (const zone of this.zones) {
            const subZones = this.subZonesMap.get(zone.id);
            if (!subZones)
              continue;
            const shades = subZones.map((_, i) => {
              const t = subZones.length > 1 ? i / (subZones.length - 1) : 0;
              return lerpColor(zone.color, "#FFFFFF", 0.15 + t * 0.35);
            });
            for (let si = 0; si < subZones.length; si++) {
              drawZone(ctx, subZones[si], w2sFn, subAlpha, true, false, false, shades[si]);
            }
          }
        }
      }
    }
    if (showLinks) {
      ctx.save();
      ctx.strokeStyle = th.linkStroke;
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (const link of pts[i].links) {
          const j = idx.get(link);
          if (j == null || j <= i)
            continue;
          ctx.beginPath();
          ctx.moveTo(scr[i].x, scr[i].y);
          ctx.lineTo(scr[j].x, scr[j].y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    const fi = this.selectedIdx >= 0 ? this.selectedIdx : this.hoverIdx;
    if (fi >= 0 && showLinks) {
      ctx.save();
      ctx.strokeStyle = "#BCDC2B";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      const fp = pts[fi];
      for (const link of fp.links) {
        const j = idx.get(link);
        if (j == null)
          continue;
        ctx.beginPath();
        ctx.moveTo(scr[fi].x, scr[fi].y);
        ctx.lineTo(scr[j].x, scr[j].y);
        ctx.stroke();
      }
      for (let i = 0; i < pts.length; i++) {
        if (i === fi)
          continue;
        if (pts[i].links.includes(fp.path)) {
          ctx.beginPath();
          ctx.moveTo(scr[i].x, scr[i].y);
          ctx.lineTo(scr[fi].x, scr[fi].y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    const baseR = Math.max(1.5, 1.5 * zoom);
    for (let i = 0; i < pts.length; i++) {
      const s = scr[i];
      if (s.x < -80 || s.x > W + 80 || s.y < -80 || s.y > H + 80)
        continue;
      const sel = i === this.selectedIdx;
      const hov = i === this.hoverIdx;
      const r = sel ? baseR * 1.4 : baseR;
      const alpha = hov || sel ? 1 : 0.78;
      if (zoom > 2) {
        const glowR = r * 2.5;
        const grad = ctx.createRadialGradient(s.x, s.y, r * 0.3, s.x, s.y, glowR);
        const c = this.color(pts[i]);
        grad.addColorStop(0, c.slice(0, 7) + "30");
        grad.addColorStop(1, c.slice(0, 7) + "00");
        ctx.fillStyle = grad;
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }
      if (isSem && pts[i].semA >= 0 && pts[i].semB >= 0 && pts[i].semA !== pts[i].semB) {
        this.drawSemPt(ctx, s.x, s.y, r, pts[i], alpha);
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = this.color(pts[i]);
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (this.selectedIdx >= 0) {
      const s = scr[this.selectedIdx];
      ctx.beginPath();
      ctx.arc(s.x, s.y, baseR * 2.2, 0, Math.PI * 2);
      ctx.strokeStyle = "#C9963B";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    const labelAlpha = Math.min(1, Math.max(0, (zoom - 5) / 3));
    if (labelAlpha > 0.01 && this.plugin.settings.showNoteTitles)
      this.drawGlobalLabels(ctx, pts, scr, labelAlpha, W, H);
    if (zoom > 1.2 && this.plugin.settings.minimapCorner !== "off") {
      this.drawMinimap(ctx, W, H);
    }
    if (this.hoverIdx >= 0 && labelAlpha < 0.5) {
      this.drawTooltip(ctx, scr[this.hoverIdx], pts[this.hoverIdx].title);
    }
  }
  // ---------- semantic point ----------
  drawSemPt(ctx, sx, sy, r, p, a) {
    const cA = SEM_PALETTE3[p.semA % SEM_PALETTE3.length];
    const cB = SEM_PALETTE3[p.semB % SEM_PALETTE3.length];
    const split = SEM_SPLIT[p.semW] ?? 0.5;
    const grad = ctx.createConicGradient(0, sx, sy);
    grad.addColorStop(0, cA);
    grad.addColorStop(split, cA);
    grad.addColorStop(Math.min(split + 1e-3, 1), cB);
    grad.addColorStop(1, cB);
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.globalAlpha = a;
    ctx.fill();
    ctx.globalAlpha = a * 0.12;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(sx - r * 0.2, sy - r * 0.25, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // ---------- labels ----------
  drawGlobalLabels(ctx, pts, scr, alpha, W, H) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "5px var(--font-interface)";
    ctx.fillStyle = this.theme.text;
    ctx.textAlign = "left";
    for (let i = 0; i < pts.length; i++) {
      const s = scr[i];
      if (s.x < -50 || s.x > W + 50 || s.y < -50 || s.y > H + 50)
        continue;
      const t = pts[i].title.length > 40 ? pts[i].title.slice(0, 37) + "..." : pts[i].title;
      ctx.fillText(t, s.x + 4, s.y + 2);
    }
    ctx.restore();
  }
  // ---------- tooltip ----------
  drawTooltip(ctx, s, title) {
    const th = this.theme;
    const label = title.length > 60 ? title.slice(0, 57) + "..." : title;
    ctx.font = "12px var(--font-interface)";
    const tw = ctx.measureText(label).width;
    const pad = 7;
    const tx = s.x + 14, ty = s.y - 14;
    ctx.fillStyle = th.panelBg;
    ctx.beginPath();
    ctx.roundRect(tx - pad, ty - 15, tw + pad * 2, 22, 5);
    ctx.fill();
    ctx.strokeStyle = th.panelBorder;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = th.text;
    ctx.textAlign = "left";
    ctx.fillText(label, tx, ty);
  }
  // ===================== active note sync =====================
  syncActiveNoteSelection() {
    const file = this.app.workspace.getActiveFile();
    if (!file)
      return;
    const idx = this.points.findIndex((p) => p.path === file.path);
    if (idx >= 0) {
      this.selectedIdx = idx;
      this.animateTo(this.points[idx].x, this.points[idx].y);
    }
  }
  // ===================== minimap =====================
  drawMinimap(ctx, W, H) {
    const size = Math.min(160, Math.min(W, H) * 0.28);
    const pad = 14;
    const corner = this.plugin.settings.minimapCorner;
    let ox, oy;
    if (corner === "top-left") {
      ox = pad;
      oy = pad;
    } else if (corner === "top-right") {
      ox = W - size - pad;
      oy = pad;
    } else if (corner === "bottom-right") {
      ox = W - size - pad;
      oy = H - size - pad;
    } else {
      ox = pad;
      oy = H - size - pad;
    }
    const th = this.theme;
    ctx.save();
    ctx.fillStyle = th.panelBg;
    ctx.strokeStyle = th.panelBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(ox, oy, size, size, 6);
    ctx.fill();
    ctx.stroke();
    ctx.clip();
    const all = this.allPoints;
    const margin = 8;
    const inner = size - margin * 2;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of all) {
      if (p.x < minX)
        minX = p.x;
      if (p.x > maxX)
        maxX = p.x;
      if (p.y < minY)
        minY = p.y;
      if (p.y > maxY)
        maxY = p.y;
    }
    const rangeX = maxX - minX || 0.01;
    const rangeY = maxY - minY || 0.01;
    const scale = inner / Math.max(rangeX, rangeY);
    const cxOff = ox + margin + (inner - rangeX * scale) / 2;
    const cyOff = oy + margin + (inner - rangeY * scale) / 2;
    if (this.plugin.settings.showZones && this.zones.length > 0) {
      const w2m = (wx, wy) => ({
        x: cxOff + (wx - minX) * scale,
        y: cyOff + (maxY - wy) * scale
      });
      const isWorldmap = this.plugin.settings.zoneStyle === "worldmap";
      const isDark = document.body.classList.contains("theme-dark");
      const borderCol = isDark ? "rgba(200,220,255,0.3)" : "rgba(40,60,100,0.3)";
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 1;
      if (isWorldmap && this.continents.length > 0) {
        for (const cont of this.continents) {
          if (!cont.coastline || cont.coastline.length < 3)
            continue;
          ctx.beginPath();
          const s0 = w2m(cont.coastline[0].x, cont.coastline[0].y);
          ctx.moveTo(s0.x, s0.y);
          for (let i = 1; i < cont.coastline.length; i++) {
            const sp = w2m(cont.coastline[i].x, cont.coastline[i].y);
            ctx.lineTo(sp.x, sp.y);
          }
          ctx.closePath();
          ctx.stroke();
        }
        for (const edge of this.borderEdges) {
          if (edge.edgeType !== "border")
            continue;
          if (edge.vertices.length < 2)
            continue;
          ctx.beginPath();
          const s0 = w2m(edge.vertices[0].x, edge.vertices[0].y);
          ctx.moveTo(s0.x, s0.y);
          for (let i = 1; i < edge.vertices.length; i++) {
            const sp = w2m(edge.vertices[i].x, edge.vertices[i].y);
            ctx.lineTo(sp.x, sp.y);
          }
          ctx.stroke();
        }
      } else {
        for (const zone of this.zones) {
          if (zone.blob.length < 3)
            continue;
          ctx.beginPath();
          const s0 = w2m(zone.blob[0].x, zone.blob[0].y);
          ctx.moveTo(s0.x, s0.y);
          for (let i = 1; i < zone.blob.length; i++) {
            const sp = w2m(zone.blob[i].x, zone.blob[i].y);
            ctx.lineTo(sp.x, sp.y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
    for (const p of all) {
      const sx = cxOff + (p.x - minX) * scale;
      const sy = cyOff + (maxY - p.y) * scale;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color(p);
      ctx.globalAlpha = 0.7;
      ctx.fill();
    }
    if (this.selectedIdx >= 0) {
      const sp = this.points[this.selectedIdx];
      const sx = cxOff + (sp.x - minX) * scale;
      const sy = cyOff + (maxY - sp.y) * scale;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#C9963B";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 1;
      ctx.stroke();
    }
    const topLeft = this.s2w(0, 0);
    const bottomRight = this.s2w(W, H);
    const vx1 = cxOff + (topLeft.x - minX) * scale;
    const vy1 = cyOff + (maxY - topLeft.y) * scale;
    const vx2 = cxOff + (bottomRight.x - minX) * scale;
    const vy2 = cyOff + (maxY - bottomRight.y) * scale;
    ctx.strokeStyle = th.text;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.min(vx1, vx2),
      Math.min(vy1, vy2),
      Math.abs(vx2 - vx1),
      Math.abs(vy2 - vy1)
    );
    ctx.restore();
  }
  // ===================== interactions =====================
  setupInteractions() {
    const c = this.canvas;
    c.addEventListener("mousedown", (e) => {
      this.cancelAnimation();
      this.dragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.dragPanX = this.panX;
      this.dragPanY = this.panY;
      c.style.cursor = "grabbing";
    });
    c.addEventListener("mousemove", (e) => {
      if (this.dragging) {
        this.panX = this.dragPanX + (e.clientX - this.dragStartX);
        this.panY = this.dragPanY + (e.clientY - this.dragStartY);
        this.draw();
        return;
      }
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const hitR = Math.max(10, 8 * this.zoom);
      let best = -1, bestD = Infinity;
      for (let i = 0; i < this.points.length; i++) {
        const s = this.w2s(this.points[i].x, this.points[i].y);
        const d = (s.x - mx) ** 2 + (s.y - my) ** 2;
        if (d < hitR * hitR && d < bestD) {
          bestD = d;
          best = i;
        }
      }
      if (best !== this.hoverIdx) {
        this.hoverIdx = best;
        c.style.cursor = best >= 0 ? "pointer" : "grab";
        this.draw();
      }
    });
    c.addEventListener("mouseup", (e) => {
      const was = this.dragging;
      this.dragging = false;
      c.style.cursor = this.hoverIdx >= 0 ? "pointer" : "grab";
      const dx = e.clientX - this.dragStartX, dy = e.clientY - this.dragStartY;
      if (was && dx * dx + dy * dy < 9)
        this.handleClick();
    });
    c.addEventListener("mouseleave", () => {
      this.dragging = false;
      if (this.hoverIdx !== -1) {
        this.hoverIdx = -1;
        this.draw();
      }
    });
    c.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.cancelAnimation();
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const before = this.s2w(mx, my);
      this.zoom = Math.max(0.1, Math.min(50, this.zoom * (e.deltaY < 0 ? 1.08 : 0.92)));
      const cw = c.clientWidth, ch = c.clientHeight;
      const s = Math.min(cw, ch) * 0.42 * this.zoom;
      this.panX = mx - cw / 2 - before.x * s;
      this.panY = my - ch / 2 + before.y * s;
      this.updateStatus();
      this.draw();
    }, { passive: false });
    let lastTouchDist = 0;
    let lastTouchMidX = 0;
    let lastTouchMidY = 0;
    c.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.cancelAnimation();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        this.dragging = true;
        this.dragStartX = t.clientX;
        this.dragStartY = t.clientY;
        this.dragPanX = this.panX;
        this.dragPanY = this.panY;
        const rect = c.getBoundingClientRect();
        const mx = t.clientX - rect.left, my = t.clientY - rect.top;
        const hitR = Math.max(16, 10 * this.zoom);
        let best = -1, bestD = Infinity;
        for (let i = 0; i < this.points.length; i++) {
          const s = this.w2s(this.points[i].x, this.points[i].y);
          const d = (s.x - mx) ** 2 + (s.y - my) ** 2;
          if (d < hitR * hitR && d < bestD) {
            bestD = d;
            best = i;
          }
        }
        this.hoverIdx = best;
      } else if (e.touches.length === 2) {
        this.dragging = false;
        const [a, b] = [e.touches[0], e.touches[1]];
        lastTouchDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        lastTouchMidX = (a.clientX + b.clientX) / 2;
        lastTouchMidY = (a.clientY + b.clientY) / 2;
      }
    }, { passive: false });
    c.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && this.dragging) {
        const t = e.touches[0];
        this.panX = this.dragPanX + (t.clientX - this.dragStartX);
        this.panY = this.dragPanY + (t.clientY - this.dragStartY);
        this.draw();
      } else if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const midX = (a.clientX + b.clientX) / 2;
        const midY = (a.clientY + b.clientY) / 2;
        const rect = c.getBoundingClientRect();
        const mx = midX - rect.left, my = midY - rect.top;
        const before = this.s2w(mx, my);
        const factor = dist / (lastTouchDist || 1);
        this.zoom = Math.max(0.1, Math.min(50, this.zoom * factor));
        const cw = c.clientWidth, ch = c.clientHeight;
        const s = Math.min(cw, ch) * 0.42 * this.zoom;
        this.panX = mx - cw / 2 - before.x * s + (midX - lastTouchMidX);
        this.panY = my - ch / 2 + before.y * s + (midY - lastTouchMidY);
        lastTouchDist = dist;
        lastTouchMidX = midX;
        lastTouchMidY = midY;
        this.updateStatus();
        this.draw();
      }
    }, { passive: false });
    c.addEventListener("touchend", (e) => {
      if (e.touches.length === 0 && this.dragging) {
        this.dragging = false;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - this.dragStartX;
        const dy = (e.changedTouches[0]?.clientY ?? 0) - this.dragStartY;
        if (dx * dx + dy * dy < 16)
          this.handleClick();
        this.hoverIdx = -1;
        this.draw();
      }
    });
  }
  handleClick() {
    const i = this.hoverIdx;
    if (i < 0) {
      this.selectedIdx = -1;
      this.draw();
      return;
    }
    this.selectedIdx = i;
    const p = this.points[i];
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    const targetLeaf = leaves.length > 0 ? leaves[0] : this.app.workspace.getLeaf("tab");
    targetLeaf.openFile(this.app.vault.getFileByPath(p.path));
    this.animateTo(p.x, p.y);
  }
  updateStatus() {
    const t = this.allPoints.length;
    const z = this.zoom.toFixed(1);
    this.statusEl.textContent = `${t} notes | zoom ${z}x`;
  }
  async refresh() {
    await this.loadPoints();
    this.resizeCanvas();
    this.draw();
  }
};

// src/main.ts
var SEM_PALETTE4 = [
  "#00D6FF",
  "#B9FF00",
  "#FF7A00",
  "#A855F7",
  "#00FFB3",
  "#FF3DB8",
  "#00FFA3",
  "#FFD400",
  "#00F5D4",
  "#FF9A3D",
  "#7CFFCB",
  "#B8C0FF"
];
var FOLDER_COLORS2 = [
  "#8E9AAF",
  "#C9963B",
  "#B28DFF",
  "#5AC6CE",
  "#B8541A",
  "#9AB2AF",
  "#BCDC2B",
  "#FF7A00",
  "#A855F7",
  "#00D6FF",
  "#00FFB3",
  "#FF3DB8"
];
var SEM_SPLIT2 = { 1: 0.8, 2: 0.65, 3: 0.5, 4: 0.35, 5: 0.2 };
function hexToRgb2(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function lerpHex(c1, c2, t) {
  const [r1, g1, b1] = hexToRgb2(c1);
  const [r2, g2, b2] = hexToRgb2(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}
function noteColor(note, folderColors) {
  const semA = note.semA ?? -1;
  const semB = note.semB ?? -1;
  const semW = note.semW ?? 3;
  if (semA >= 0) {
    const cA = SEM_PALETTE4[semA % SEM_PALETTE4.length];
    if (semB < 0 || semA === semB)
      return cA;
    const cB = SEM_PALETTE4[semB % SEM_PALETTE4.length];
    return lerpHex(cA, cB, 1 - (SEM_SPLIT2[semW] ?? 0.5));
  }
  return folderColors.get(note.folder) || FOLDER_COLORS2[0];
}
var ChorographiaPlugin = class extends import_obsidian7.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.cache = { notes: {} };
    this.explorerStyleEl = null;
  }
  async onload() {
    await this.loadSettings();
    await this.loadCache();
    const noteEntries = Object.values(this.cache.notes);
    if (noteEntries.length > 0 && noteEntries.some((n) => n.embedding) && !noteEntries.some((n) => n.semA != null)) {
      await this.computeSemanticColors();
    }
    this.registerView(VIEW_TYPE, (leaf) => new ChorographiaView(leaf, this));
    this.addRibbonIcon("map", "Open Chorographia Map", () => {
      this.activateView();
    });
    this.addCommand({
      id: "open-chorographia-map",
      name: "Open Chorographia Map",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "re-embed-changed",
      name: "Re-embed changed notes",
      callback: () => this.runEmbedPipeline()
    });
    this.addSettingTab(new ChorographiaSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(() => {
      this.updateExplorerDots();
    });
  }
  async onunload() {
    this.removeExplorerDots();
  }
  async activateView() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
      this.app.workspace.revealLeaf(leaf);
    }
  }
  // --- Settings persistence ---
  async loadSettings() {
    const data = await this.loadData();
    if (data?.settings) {
      this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    }
  }
  async saveSettings() {
    const data = await this.loadData() || {};
    data.settings = this.settings;
    await this.saveData(data);
  }
  // --- Cache persistence ---
  async loadCache() {
    const data = await this.loadData();
    if (data?.cache) {
      this.cache = data.cache;
    }
  }
  async saveCache() {
    const data = await this.loadData() || {};
    data.cache = this.cache;
    await this.saveData(data);
  }
  // --- Pipeline commands ---
  get embeddingModelString() {
    switch (this.settings.embeddingProvider) {
      case "ollama":
        return `ollama:${this.settings.ollamaEmbedModel}`;
      case "openai":
        return `openai:${this.settings.embeddingModel}`;
      case "openrouter":
        return `openrouter:${this.settings.openrouterEmbedModel}`;
    }
  }
  async runEmbedPipeline() {
    if (this.settings.embeddingProvider === "openai" && !this.settings.openaiApiKey) {
      new import_obsidian7.Notice("Chorographia: Set your OpenAI API key in settings first.");
      return;
    }
    if (this.settings.embeddingProvider === "openrouter" && !this.settings.openrouterApiKey) {
      new import_obsidian7.Notice("Chorographia: Set your OpenRouter API key in settings first.");
      return;
    }
    const globs = this.settings.includeGlobs.split(",").map((g) => g.trim()).filter(Boolean);
    const excludeGlobs = this.settings.excludeGlobs.split(",").map((g) => g.trim()).filter(Boolean);
    new import_obsidian7.Notice("Chorographia: Indexing vault...");
    const notes = await indexVault(
      this.app.vault,
      globs,
      excludeGlobs,
      this.settings.maxNotes
    );
    new import_obsidian7.Notice(`Chorographia: Found ${notes.length} notes.`);
    const modelStr = this.embeddingModelString;
    const toEmbed = [];
    for (const note of notes) {
      const cached = this.cache.notes[note.path];
      if (cached && cached.sha256 === note.sha256 && cached.model === modelStr && cached.embedding) {
        cached.title = note.title;
        cached.folder = note.folder;
        cached.noteType = note.noteType;
        cached.cat = note.cat;
        cached.links = note.links;
        continue;
      }
      toEmbed.push({ path: note.path, text: note.embedText });
    }
    const indexedPaths = new Set(notes.map((n) => n.path));
    for (const path of Object.keys(this.cache.notes)) {
      if (!indexedPaths.has(path)) {
        delete this.cache.notes[path];
      }
    }
    if (toEmbed.length === 0) {
      new import_obsidian7.Notice("Chorographia: All notes up to date.");
      await this.saveCache();
      this.refreshMapViews();
      this.updateExplorerDots();
      return;
    }
    new import_obsidian7.Notice(
      `Chorographia: Embedding ${toEmbed.length} notes...`
    );
    const onProgress = (done, total) => {
      new import_obsidian7.Notice(`Chorographia: Embedded ${done}/${total}`);
    };
    let results;
    switch (this.settings.embeddingProvider) {
      case "ollama":
        results = await embedTextsOllama(toEmbed, this.settings.ollamaUrl, this.settings.ollamaEmbedModel, onProgress);
        break;
      case "openai":
        results = await embedTexts(toEmbed, this.settings.openaiApiKey, this.settings.embeddingModel, onProgress);
        break;
      case "openrouter":
        results = await embedTextsOpenRouter(toEmbed, this.settings.openrouterApiKey, this.settings.openrouterEmbedModel, onProgress);
        break;
    }
    for (const r of results) {
      const note = notes.find((n) => n.path === r.path);
      this.cache.notes[r.path] = {
        sha256: note.sha256,
        model: modelStr,
        embedding: r.embedding,
        x: this.cache.notes[r.path]?.x,
        y: this.cache.notes[r.path]?.y,
        title: note.title,
        folder: note.folder,
        noteType: note.noteType,
        cat: note.cat,
        links: note.links
      };
    }
    for (const note of notes) {
      if (this.cache.notes[note.path]) {
        this.cache.notes[note.path].title = note.title;
        this.cache.notes[note.path].folder = note.folder;
        this.cache.notes[note.path].noteType = note.noteType;
        this.cache.notes[note.path].cat = note.cat;
        this.cache.notes[note.path].links = note.links;
      }
    }
    if (this.settings.mapLocked) {
      this.preserveAndInvalidateZones();
    } else {
      this.cache.zones = {};
    }
    if (this.settings.mapLocked) {
      this.computeSemanticColorsLocked();
    } else {
      await this.computeSemanticColors();
    }
    await this.saveCache();
    this.refreshMapViews();
    this.updateExplorerDots();
    new import_obsidian7.Notice(`Chorographia: Embedding complete (${results.length} new).`);
    const hasLayout = Object.values(this.cache.notes).some(
      (n) => n.x != null
    );
    const hasNewWithoutCoords = this.settings.mapLocked && Object.values(this.cache.notes).some((n) => n.embedding && n.x == null);
    if (!hasLayout || hasNewWithoutCoords) {
      await this.runLayoutCompute();
    }
  }
  async runZoneNaming() {
    if (this.settings.mapLocked) {
      delete this.cache.lockedLabels;
      delete this.cache.lockedSubLabels;
    }
    this.cache.zones = {};
    await this.saveCache();
    await this.refreshMapViews();
  }
  async refreshMapViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      await leaf.view.refresh();
    }
  }
  updateExplorerDots() {
    this.removeExplorerDots();
    if (!this.settings.showExplorerDots)
      return;
    const notes = this.cache.notes;
    if (Object.keys(notes).length === 0)
      return;
    const folders = /* @__PURE__ */ new Set();
    for (const n of Object.values(notes)) {
      if (n.folder)
        folders.add(n.folder);
    }
    const folderArr = [...folders].sort();
    const folderColors = /* @__PURE__ */ new Map();
    folderArr.forEach((f, i) => {
      folderColors.set(f, FOLDER_COLORS2[i % FOLDER_COLORS2.length]);
    });
    const dotSize = 9;
    const dotLeft = 104 + 6;
    const totalPad = dotLeft + dotSize + 6;
    const rules = [];
    rules.push(
      `.chorographia-dots .nav-file-title[data-path] .nav-file-title-content { padding-left: ${totalPad}px !important; }`
    );
    for (const [path, note] of Object.entries(notes)) {
      const color = noteColor(note, folderColors);
      const escaped = CSS.escape(path);
      rules.push(
        `.nav-file-title[data-path="${escaped}"] .nav-file-title-content { background-image: radial-gradient(circle, transparent 0 58%, var(--background-primary) 60% 100%), radial-gradient(circle at 40% 35%, rgba(255,255,255,0.15) 0 45%, transparent 78%), radial-gradient(circle, ${color} 50%, transparent 51%); background-size: ${dotSize}px ${dotSize}px; background-position: ${dotLeft}px 50%; background-repeat: no-repeat; }`
      );
    }
    const el = document.createElement("style");
    el.id = "chorographia-explorer-dots";
    el.textContent = rules.join("\n");
    document.head.appendChild(el);
    this.explorerStyleEl = el;
    document.querySelectorAll(".nav-files-container").forEach((c) => {
      c.classList.add("chorographia-dots");
    });
  }
  removeExplorerDots() {
    if (this.explorerStyleEl) {
      this.explorerStyleEl.remove();
      this.explorerStyleEl = null;
    }
    document.getElementById("chorographia-explorer-dots")?.remove();
    document.querySelectorAll(".chorographia-dots").forEach((c) => {
      c.classList.remove("chorographia-dots");
    });
  }
  async runLayoutCompute() {
    const count = Object.values(this.cache.notes).filter(
      (n) => n.embedding
    ).length;
    if (count === 0) {
      new import_obsidian7.Notice("Chorographia: No embeddings cached. Run re-embed first.");
      return;
    }
    if (this.settings.mapLocked) {
      const newPaths = Object.entries(this.cache.notes).filter(([_, n]) => n.embedding && n.x == null).map(([p]) => p);
      if (newPaths.length === 0) {
        new import_obsidian7.Notice("Chorographia: All notes already placed.");
      } else {
        new import_obsidian7.Notice(`Chorographia: Placing ${newPaths.length} new notes...`);
        const points = interpolateNewPoints(this.cache.notes, newPaths);
        for (const p of points) {
          if (this.cache.notes[p.path]) {
            this.cache.notes[p.path].x = p.x;
            this.cache.notes[p.path].y = p.y;
          }
        }
      }
      this.computeSemanticColorsLocked();
      this.preserveAndInvalidateZones();
    } else {
      new import_obsidian7.Notice(`Chorographia: Computing layout for ${count} notes...`);
      await new Promise((resolve) => {
        setTimeout(() => {
          const points = computeLayout(this.cache.notes);
          for (const p of points) {
            if (this.cache.notes[p.path]) {
              this.cache.notes[p.path].x = p.x;
              this.cache.notes[p.path].y = p.y;
            }
          }
          resolve();
        }, 50);
      });
      this.cache.zones = {};
      await this.computeSemanticColors();
    }
    await this.saveCache();
    new import_obsidian7.Notice("Chorographia: Layout computed.");
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      leaf.view.refresh();
    }
    this.updateExplorerDots();
  }
  async computeSemanticColors() {
    const paths = [];
    const vectors = [];
    for (const [path, note] of Object.entries(this.cache.notes)) {
      if (note.embedding) {
        paths.push(path);
        vectors.push(decodeFloat32(note.embedding));
      }
    }
    if (vectors.length === 0)
      return;
    const k = Math.min(this.settings.zoneGranularity, vectors.length);
    const { centroids } = kMeans(vectors, k);
    const assignments = computeSemanticAssignments(vectors, centroids);
    for (let i = 0; i < paths.length; i++) {
      const note = this.cache.notes[paths[i]];
      if (note) {
        note.semA = assignments[i].semA;
        note.semB = assignments[i].semB;
        note.semW = assignments[i].semW;
      }
    }
  }
  /**
   * Assign semantic colors using cached locked centroids instead of re-running k-means.
   * Falls back to full computeSemanticColors if no locked centroids exist.
   */
  computeSemanticColorsLocked() {
    let centroids;
    if (this.cache.lockedCentroids && this.cache.lockedCentroids.length > 0) {
      centroids = this.cache.lockedCentroids.map((c) => decodeFloat32(c));
    } else if (this.cache.zones) {
      for (const entry of Object.values(this.cache.zones)) {
        if (entry.centroids && entry.centroids.length > 0) {
          centroids = entry.centroids.map((c) => decodeFloat32(c));
          break;
        }
      }
    }
    if (!centroids) {
      this.computeSemanticColors();
      return;
    }
    const paths = [];
    const vectors = [];
    for (const [path, note] of Object.entries(this.cache.notes)) {
      if (note.embedding) {
        paths.push(path);
        vectors.push(decodeFloat32(note.embedding));
      }
    }
    if (vectors.length === 0)
      return;
    const assignments = computeSemanticAssignments(vectors, centroids);
    for (let i = 0; i < paths.length; i++) {
      const note = this.cache.notes[paths[i]];
      if (note) {
        note.semA = assignments[i].semA;
        note.semB = assignments[i].semB;
        note.semW = assignments[i].semW;
      }
    }
  }
  /**
   * Extract labels + centroids from the most recent zone cache entry,
   * store them in the locked* fields, then wipe zone geometry cache.
   */
  preserveAndInvalidateZones() {
    if (this.cache.zones) {
      for (const entry of Object.values(this.cache.zones)) {
        if (entry.centroids && entry.centroids.length > 0) {
          this.cache.lockedCentroids = entry.centroids;
          this.cache.lockedLabels = entry.labels;
          this.cache.lockedSubLabels = entry.subLabels;
          break;
        }
      }
    }
    this.cache.zones = {};
  }
};
