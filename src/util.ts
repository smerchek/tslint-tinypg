import * as ts from 'typescript'
import * as Lint from 'tslint'
import * as _ from 'lodash'

type onSqlCallHook = (sql_call_name: string, call_expression: ts.CallExpression) => void

export function forEachTinySqlCall(ctx: Lint.WalkContext<void>, onSqlCall: onSqlCallHook): void {
   const cb = (node: ts.Node): void => {
      if (node && node.kind === ts.SyntaxKind.CallExpression) {
         const call_expression = node as ts.CallExpression
         const property_expression = call_expression.expression as ts.PropertyAccessExpression

         if (!property_expression || !property_expression.name) {
            return
         }

         const property_name = property_expression.name.text

         if (property_name === 'sql' && call_expression.arguments[0].kind === ts.SyntaxKind.StringLiteral) {
            const sql_call_name = _.trim(call_expression.arguments[0].getText(), `'"\``)

            onSqlCall(sql_call_name, call_expression)
         }
      }
      // Wondering why return is used below? Refer to "Make use of tail calls"
      return ts.forEachChild(node, cb) // recurse deeper
   }

   return ts.forEachChild(ctx.sourceFile, cb) // start recursion with children of sourceFile
}
