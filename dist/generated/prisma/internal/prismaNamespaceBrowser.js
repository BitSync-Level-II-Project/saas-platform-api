import * as runtime from "@prisma/client/runtime/index-browser";
export const Decimal = runtime.Decimal;
export const NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
export const DbNull = runtime.DbNull;
export const JsonNull = runtime.JsonNull;
export const AnyNull = runtime.AnyNull;
export const ModelName = {
    Template: 'Template',
    TemplateVersion: 'TemplateVersion'
};
export const TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
export const TemplateScalarFieldEnum = {
    id: 'id',
    organizationId: 'organizationId',
    createdById: 'createdById',
    name: 'name',
    description: 'description',
    metadata: 'metadata',
    fields: 'fields',
    draftRevision: 'draftRevision',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const TemplateVersionScalarFieldEnum = {
    id: 'id',
    templateId: 'templateId',
    organizationId: 'organizationId',
    version: 'version',
    sourceDraftRevision: 'sourceDraftRevision',
    name: 'name',
    description: 'description',
    metadata: 'metadata',
    fields: 'fields',
    publishedById: 'publishedById',
    publishedAt: 'publishedAt'
};
export const SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
export const JsonNullValueInput = {
    JsonNull: JsonNull
};
export const QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
export const JsonNullValueFilter = {
    DbNull: DbNull,
    JsonNull: JsonNull,
    AnyNull: AnyNull
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map