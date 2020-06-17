import { Model, QueryContext, ModelOptions } from 'objection';
import { omit } from 'lodash'

export default class BaseModel extends Model {
    created_at?: Date | string;
    updated_at?: Date | string;

    // Can this be made static?
    enableTimestamps = () => false;

    async $beforeInsert(queryContext: QueryContext) {
        await super.$beforeInsert(queryContext);
        if (this.enableTimestamps()) {
            this.created_at = new Date().toISOString();
        }
    }

    async $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
        await super.$beforeUpdate(opt, queryContext);

        if (this.enableTimestamps()) {
            this.updated_at = new Date().toISOString();
        }
    }

    get $hiddenFields(): string[] {
        return [];
    }

    getIdColumn() {
        return 'id';
    }

    $save() {
        const id: number = this[this.getIdColumn()];
        if (!id) {
            throw TypeError('Id is of invalid type null or undefined.')
        }

        return this.$query().patchAndFetchById(id, this);
    }

    $formatJson(json) {
        // Remember to call the super class's implementation.
        json = super.$formatJson(json);
        // Do your conversion here.
        return omit(json, this.$hiddenFields);
    }
}