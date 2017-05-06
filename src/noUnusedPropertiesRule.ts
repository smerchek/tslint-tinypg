import * as ts from 'typescript'
import * as Lint from 'tslint'
import * as globby from 'globby'
import * as _ from 'lodash'
import { forEachTinySqlCall } from './util'
import * as fs from 'fs'
import * as TinyPg from 'tinypg'

export class Rule extends Lint.Rules.AbstractRule {
   public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      return this.applyWithFunction(sourceFile, walk)
   }
}

function walk(ctx: Lint.WalkContext<void>): void {
   const hook = (sql_call_name, call_expression) => {
      const tiny_file_path = `${sql_call_name.replace(/\./g, '/')}.sql`
      const file = globby.sync([`**/*/${tiny_file_path}`])[0]

      if (!file || call_expression.arguments[1].kind !== ts.SyntaxKind.ObjectLiteralExpression) {
         return
      }

      const object_literal_exp = call_expression.arguments[1] as ts.ObjectLiteralExpression

      const assigned_object_properties = object_literal_exp.properties
         .filter(x => x.kind === ts.SyntaxKind.PropertyAssignment || x.kind === ts.SyntaxKind.ShorthandPropertyAssignment) as ts.PropertyAssignment[]

      if (file) {
         const contents = fs.readFileSync(file)

         const parsed_file = TinyPg.parseSql(contents.toString())

         const unused_properties = assigned_object_properties.filter(p => {
            return !parsed_file.mapping.some(x => x.name === p.name.getText())
         })

         _.forEach(unused_properties, x => {
            ctx.addFailure(
               x.getStart(ctx.sourceFile),
               x.getStart(ctx.sourceFile) + x.getWidth(),
               `Property [${x.name.getText()}] does not exist in sql call [${sql_call_name}].`
            )
         })
      }
   }

   return forEachTinySqlCall(ctx, hook)
}

