// https://peggyjs.org/online.html
start
  = statement

statement
  = lhs:word _ op:compareOp _ rhs:(quotedString / word) {
      return { left: lhs, operator: op, right: rhs };
  }

word
  = chars:[a-zA-Z0-9@._-]+ {
      return chars.join("");
  }

quotedString
  = '"' chars:[^"]* '"' {
      return chars.join("");
  }

compareOp
  = "eq" / "ne" / "co" / "sw" / "ew" / "gt" / "lt" / "ge" / "le"

_ "whitespace"
  = [ \t\n\r]*  // Optional whitespace
