{
  function toBinaryOp(operator, left, right) {
    return { type: 'logical', operator, left, right };
  }
  function toNot(expr) {
    return { type: 'not', expression: expr };
  }
  function toAttrExp(attribute, operator, value) {
    return { type: 'comparison', attribute, operator, value };
  }
  function toPresent(attribute) {
    return { type: 'present', attribute };
  }
  function toValuePath(attribute, filter) {
    return { type: 'valuePath', attribute, filter };
  }
}

Filter
  = _ expr:OrExpr _ { return expr; }

OrExpr
  = left:AndExpr _ "or"i _ right:OrExpr { return toBinaryOp('or', left, right); }
  / AndExpr

AndExpr
  = left:NotExpr _ "and"i _ right:AndExpr { return toBinaryOp('and', left, right); }
  / NotExpr

NotExpr
  = "not"i _ "(" _ expr:Filter _ ")" { return toNot(expr); }
  / Primary

Primary
  = ValuePath
  / AttrExp
  / "(" _ expr:Filter _ ")" { return expr; }

ValuePath
  = attr:AttrPath "[" _ filter:ValFilter _ "]" { return toValuePath(attr, filter); }

ValFilter
  = _ expr:ValOrExpr _ { return expr; }

ValOrExpr
  = left:ValAndExpr _ "or"i _ right:ValOrExpr { return toBinaryOp('or', left, right); }
  / ValAndExpr

ValAndExpr
  = left:ValNotExpr _ "and"i _ right:ValAndExpr { return toBinaryOp('and', left, right); }
  / ValNotExpr

ValNotExpr
  = "not"i _ "(" _ expr:ValFilter _ ")" { return toNot(expr); }
  / AttrExp

AttrExp
  = attr:AttrPath _ "pr"i { return toPresent(attr); }
  / attr:AttrPath _ op:CompareOp _ val:CompValue { return toAttrExp(attr, op, val); }

CompareOp
  = "eq"i { return "eq"; }
  / "ne"i { return "ne"; }
  / "co"i { return "co"; }
  / "sw"i { return "sw"; }
  / "ew"i { return "ew"; }
  / "gt"i { return "gt"; }
  / "lt"i { return "lt"; }
  / "ge"i { return "ge"; }
  / "le"i { return "le"; }

AttrPath
  = path:$((UriPrefix ATTRNAME) / ATTRNAME) sub:SubAttr* {
      return {
        type: "attrPath",
        path: path + sub.join("")
      };
    }

UriPrefix
  = prefix:$(UriSegment ":")+ {
      return prefix;
    }

UriSegment
  = [A-Za-z0-9+.\-]+

SubAttr
  = "." name:ATTRNAME { return "." + name; }

ATTRNAME
  = head:[A-Za-z] tail:[A-Za-z0-9_-]* {
      return head + tail.join("");
    }

CompValue
  = "true"i { return true; }
  / "false"i { return false; }
  / "null"i { return null; }
  / num:Number { return num; }
  / str:String { return str; }

Number
  = n:$([0-9]+ ("." [0-9]+)?) { return parseFloat(n); }

String
  = "\"" chars:DoubleQuotedChar* "\"" { return chars.join(""); }

DoubleQuotedChar
  = "\\" esc:["\\/bfnrt"] { return JSON.parse('"\\' + esc + '"'); }
  / "\\u" h1:[0-9a-fA-F] h2:[0-9a-fA-F] h3:[0-9a-fA-F] h4:[0-9a-fA-F]
    {
      const hex = h1 + h2 + h3 + h4;
      return String.fromCharCode(parseInt(hex, 16));
    }
  / !["\\"] char:. { return char; }

_ = [ \t\r\n]*
