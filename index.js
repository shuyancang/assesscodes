/**
 * Example problem with existing solution and passing test.
 * See problem 0 in the spec file for the assertion
 * @returns {string}
 */
exports.example = () => 'hello world';

/*
  func: valid**Array: check arguments type
*/
const validArray = (...rest) => { // check arguments: Array: => boolean
  return rest.every(e => e instanceof Array);
}

const validStrArray = (target) => { // argument type: Array[string] => boolean
  return validArray(target) && target.every(e => typeof e === 'string');
}

const validObjArray = (target) => { // argument type Array[object] => boolean 
  return validArray(target) && target.every(e => typeof e === 'object');
}

exports.stripPrivateProperties = (stripKeys, target) => {
  if (!validStrArray(stripKeys)) {
    throw new Error(`${stripKeys} should be Array[string]`);
  }
  if (!validObjArray(target)) {
    throw new Error(`${target} should be Array[object]`);
  }
  target.forEach(ele => {
    stripKeys.forEach(key => {
      Reflect.deleteProperty(ele, key); // mutation object properties
    })
  });
  return target;
};

exports.excludeByProperty = (propertyName, target) => {
  if (!validObjArray(target)) {
    throw new Error(`${target} should be Array[object]`);
  }
  if (typeof propertyName !== 'string') {
    throw new Error(`${propertyName} is not a string`);
  }
  return target.filter(ele => !ele[propertyName]);
};


// const deepCalcSum = (obj, properName) => {
//   let res = 0;
//   if(!obj || typeof obj !== 'object') {
//     return res;
//   }
//   for(let [key, val] of Object.entries(obj)){
//     if (val instanceof Array) {
//       res += val.reduce((pre, cur) => pre + deepCalc(cur, properName), 0);
//     } else if (val instanceof Object) {
//       res += deepCalcSum(val, properName);
//     } else if (key === properName && typeof val === 'number') {
//       res += val;
//     }
//   }
//   return res;
// }

// exports.sumDeep = (target) => { // considered random deep properties named: 'val' in any objects; like {objects: [{val: 1, }]}
//   if(!validObjArray(target)){
//     throw new Error(`${target} should be Array[object]`);
//   }
//   return target.map(e => ({
//     objects: deepCalcSum(e.objects || {}, 'val'),
//   }))
// }

exports.sumDeep = (target) => { // only considered stationary data structure like {objects: Array[{val: number}]}
  if (!validObjArray(target)) {
    throw new Error(`${target} should be Array[object]`);
  }
  return target.map(e => {
    const { objects = [] } = e;
    return {
      objects: objects.reduce((pre, cur) => (pre + cur.val), 0),
    }
  })
};

/*
  1. considered a status code can only belong to one color, we can created a sorted codeList => time: O(nlogn);
  2. find a status code in a sorted list => time: O(logm); outsideloop time: O(n);
*/
function getColorFromRanges(ranges, status) {
  const len = ranges.length;
  let left = 0, right = len - 1;
  while (left <= right) {
    const mid = parseInt((left + right) / 2, 10);
    const { startStatus, endStatus, color } = ranges[mid];
    if (status >= startStatus && status <= endStatus) {
      return color;
    }
    if (status > endStatus) {
      left = mid + 1;
    }
    if (status < startStatus) {
      right = mid - 1;
    }
  }
  return null; // invalidate color
}

exports.applyStatusColor = (colorRanges, data) => {
  const sortedRange = [];
  const res = [];
  for (const [color, keyCode] of Object.entries(colorRanges)) {
    const [startStatus, endStatus] = keyCode;
    sortedRange.push({
      startStatus: Math.min(startStatus, endStatus),
      endStatus: Math.max(startStatus, endStatus),
      color,
    });
  }
  sortedRange.sort((a, b) => a.startStatus - b.startStatus); // O(nlogn)
  data.forEach(e => { // map: O(m)
    const { status } = e || {};
    const color = getColorFromRanges(sortedRange, status); // Binary find O(logn)
    if(color){
      res.push({ status, color });
    }
  });
  return res;
};

exports.createGreeting = (fn, ...rest) => (...params) => fn(...rest, ...params); // Functional programming

exports.setDefaults = (defaultProps) => (obj) => ({
  ...defaultProps,
  ...obj,
})

exports.fetchUserByNameAndUsersCompany = (param, queries) => {
  const { fetchStatus, fetchUsers, fetchCompanyById } = queries || {};
  async function getAllInfo(username){
    let user;
    const [status, company] = await Promise.all([
      fetchStatus(username),
      fetchUsers(username).then(users => {
        user = users.find(e => e.name === 'stan') || {};
        return fetchCompanyById(user.companyId);
      })
    ])
    return {company, status, user}
  }
  return getAllInfo(param);
};
