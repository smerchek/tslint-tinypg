import * as ts from 'typescript'
import * as Lint from 'tslint'
import * as globby from 'globby'
import * as _ from 'lodash'
import { forEachTinySqlCall } from './util'

export class Rule extends Lint.Rules.AbstractRule {
   public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      return this.applyWithFunction(sourceFile, walk)
   }
}

function walk(ctx: Lint.WalkContext<void>): void {
   const tinySqlFiles: string[] = globby.sync(['**/*.sql', '!**/node_modules/**'])

   const hook = (sql_call_name: string, call_expression: ts.CallExpression) => {
      const tiny_file_path = `${sql_call_name.replace(/\./g, '/')}.sql`

      if (!_.some(tinySqlFiles, x => _.includes(x, tiny_file_path))) {
         ctx.addFailure(
            call_expression.arguments[0].getStart(ctx.sourceFile),
            call_expression.arguments[0].getStart(ctx.sourceFile) + call_expression.arguments[0].getWidth(),
            `No SQL file found for [${sql_call_name}].`
         )
      }
   }

   return forEachTinySqlCall(ctx, hook)
}
