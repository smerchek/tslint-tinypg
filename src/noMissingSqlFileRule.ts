import * as ts from 'typescript'
import * as Lint from 'tslint'
import * as globby from 'globby'
import * as _ from 'lodash'

export class Rule extends Lint.Rules.AbstractRule {
   public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      return this.applyWithFunction(sourceFile, walk)
   }
}

function walk(ctx: Lint.WalkContext<void>): void {
   const tinySqlFiles: string[] = globby.sync(['**/*.sql', '!**/node_modules/**'])

   const cb = (node: ts.Node): void => {
      if (node && node.kind === ts.SyntaxKind.CallExpression) {
         const call_expression = node as ts.CallExpression
         const property_expression = call_expression.expression as ts.PropertyAccessExpression

         if (!property_expression || !property_expression.name) {
            return
         }

         const property_name = property_expression.name.text

         if (property_name === 'sql' && call_expression.arguments[0].kind === ts.SyntaxKind.StringLiteral) {
            const sql_call_text = call_expression.arguments[0].getText()
            const tiny_file_path = `${_.trim(sql_call_text, `'`).replace(/\./g, '/')}.sql`

            if (!_.some(tinySqlFiles, x => _.includes(x, tiny_file_path))) {
               ctx.addFailure(
                  call_expression.arguments[0].getStart(ctx.sourceFile),
                  call_expression.arguments[0].getStart(ctx.sourceFile) + call_expression.arguments[0].getWidth(),
                  `No SQL file found for ${sql_call_text}.`
               )
            }

         }

      }
      // Wondering why return is used below? Refer to "Make use of tail calls"
      return ts.forEachChild(node, cb) // recurse deeper
   }

   return ts.forEachChild(ctx.sourceFile, cb) // start recursion with children of sourceFile
}

