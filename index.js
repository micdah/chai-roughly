const debug = require('debug')
const deep_eql = require('deep-eql')

const log = debug('chai-roughly')

module.exports = function (chai, utils) {
    const Assertion = chai.Assertion
    const DEFAULT_TOLERANCE = 1e-6

    function numberComparatorWithTolerance(tolerance) {
        return function (left, right) {
            if (typeof left !== 'number' || typeof right !== 'number') {
                return null
            }

            const diff = Math.abs(left - right)
            const result = diff <= tolerance
            if (!result) {
                log('number %d !== %d, as difference %d is greater than tolerance %d', left, right, diff, tolerance)
            }
            return result
        }
    }

    function assertEql(_super) {
        return function (obj, msg) {
            const tolerance = utils.flag(this, 'tolerance')
            if (tolerance) {
                if (msg) flag(this, 'message', msg)
                this.assert(
                    deep_eql(obj, utils.flag(this, 'object'), {
                        comparator: numberComparatorWithTolerance(tolerance)
                    })
                    , 'expected #{this} to roughly deeply equal #{exp}'
                    , 'expected #{this} to not roughly deeply equal #{exp}'
                    , obj
                    , this._obj
                    , true
                )
            } else {
                _super.apply(this, arguments)
            }
        }
    }

    utils.overwriteMethod(Assertion.prototype, 'eql', assertEql)
    utils.overwriteMethod(Assertion.prototype, 'eqls', assertEql)

    /**
     * Comparisons using <c>eql</c> will compare numbers using a tolerance of <c>1e-6</c> unless otherwise specified
     * @namespace Chai
     * @name Assertion#roughly
     * @property {Assertion}
     */
    utils.addChainableMethod(Assertion.prototype, 'roughly',
        function (tolerance) {
            utils.flag(this, 'tolerance', tolerance)
        }, function () {
            utils.flag(this, 'tolerance', DEFAULT_TOLERANCE)
        })
}
