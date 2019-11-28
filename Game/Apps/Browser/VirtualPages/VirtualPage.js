"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("../../../Core/Observable");
class VirtualPage extends Observable_1.default {
    constructor() {
        super();
    }
    GetURL() {
        return "";
    }
    MatchesAddress(address) {
        return false;
    }
    Render(contentDiv) {
    }
    Cleanup() {
    }
}
exports.default = VirtualPage;
//# sourceMappingURL=VirtualPage.js.map