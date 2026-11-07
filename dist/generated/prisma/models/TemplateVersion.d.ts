import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TemplateVersionModel = runtime.Types.Result.DefaultSelection<Prisma.$TemplateVersionPayload>;
export type AggregateTemplateVersion = {
    _count: TemplateVersionCountAggregateOutputType | null;
    _avg: TemplateVersionAvgAggregateOutputType | null;
    _sum: TemplateVersionSumAggregateOutputType | null;
    _min: TemplateVersionMinAggregateOutputType | null;
    _max: TemplateVersionMaxAggregateOutputType | null;
};
export type TemplateVersionAvgAggregateOutputType = {
    version: number | null;
    sourceDraftRevision: number | null;
};
export type TemplateVersionSumAggregateOutputType = {
    version: number | null;
    sourceDraftRevision: number | null;
};
export type TemplateVersionMinAggregateOutputType = {
    id: string | null;
    templateId: string | null;
    organizationId: string | null;
    version: number | null;
    sourceDraftRevision: number | null;
    name: string | null;
    description: string | null;
    publishedById: string | null;
    publishedAt: Date | null;
};
export type TemplateVersionMaxAggregateOutputType = {
    id: string | null;
    templateId: string | null;
    organizationId: string | null;
    version: number | null;
    sourceDraftRevision: number | null;
    name: string | null;
    description: string | null;
    publishedById: string | null;
    publishedAt: Date | null;
};
export type TemplateVersionCountAggregateOutputType = {
    id: number;
    templateId: number;
    organizationId: number;
    version: number;
    sourceDraftRevision: number;
    name: number;
    description: number;
    metadata: number;
    fields: number;
    publishedById: number;
    publishedAt: number;
    _all: number;
};
export type TemplateVersionAvgAggregateInputType = {
    version?: true;
    sourceDraftRevision?: true;
};
export type TemplateVersionSumAggregateInputType = {
    version?: true;
    sourceDraftRevision?: true;
};
export type TemplateVersionMinAggregateInputType = {
    id?: true;
    templateId?: true;
    organizationId?: true;
    version?: true;
    sourceDraftRevision?: true;
    name?: true;
    description?: true;
    publishedById?: true;
    publishedAt?: true;
};
export type TemplateVersionMaxAggregateInputType = {
    id?: true;
    templateId?: true;
    organizationId?: true;
    version?: true;
    sourceDraftRevision?: true;
    name?: true;
    description?: true;
    publishedById?: true;
    publishedAt?: true;
};
export type TemplateVersionCountAggregateInputType = {
    id?: true;
    templateId?: true;
    organizationId?: true;
    version?: true;
    sourceDraftRevision?: true;
    name?: true;
    description?: true;
    metadata?: true;
    fields?: true;
    publishedById?: true;
    publishedAt?: true;
    _all?: true;
};
export type TemplateVersionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateVersionWhereInput;
    orderBy?: Prisma.TemplateVersionOrderByWithRelationInput | Prisma.TemplateVersionOrderByWithRelationInput[];
    cursor?: Prisma.TemplateVersionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TemplateVersionCountAggregateInputType;
    _avg?: TemplateVersionAvgAggregateInputType;
    _sum?: TemplateVersionSumAggregateInputType;
    _min?: TemplateVersionMinAggregateInputType;
    _max?: TemplateVersionMaxAggregateInputType;
};
export type GetTemplateVersionAggregateType<T extends TemplateVersionAggregateArgs> = {
    [P in keyof T & keyof AggregateTemplateVersion]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTemplateVersion[P]> : Prisma.GetScalarType<T[P], AggregateTemplateVersion[P]>;
};
export type TemplateVersionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateVersionWhereInput;
    orderBy?: Prisma.TemplateVersionOrderByWithAggregationInput | Prisma.TemplateVersionOrderByWithAggregationInput[];
    by: Prisma.TemplateVersionScalarFieldEnum[] | Prisma.TemplateVersionScalarFieldEnum;
    having?: Prisma.TemplateVersionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TemplateVersionCountAggregateInputType | true;
    _avg?: TemplateVersionAvgAggregateInputType;
    _sum?: TemplateVersionSumAggregateInputType;
    _min?: TemplateVersionMinAggregateInputType;
    _max?: TemplateVersionMaxAggregateInputType;
};
export type TemplateVersionGroupByOutputType = {
    id: string;
    templateId: string;
    organizationId: string;
    version: number;
    sourceDraftRevision: number;
    name: string;
    description: string;
    metadata: runtime.JsonValue;
    fields: runtime.JsonValue;
    publishedById: string;
    publishedAt: Date;
    _count: TemplateVersionCountAggregateOutputType | null;
    _avg: TemplateVersionAvgAggregateOutputType | null;
    _sum: TemplateVersionSumAggregateOutputType | null;
    _min: TemplateVersionMinAggregateOutputType | null;
    _max: TemplateVersionMaxAggregateOutputType | null;
};
export type GetTemplateVersionGroupByPayload<T extends TemplateVersionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TemplateVersionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TemplateVersionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TemplateVersionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TemplateVersionGroupByOutputType[P]>;
}>>;
export type TemplateVersionWhereInput = {
    AND?: Prisma.TemplateVersionWhereInput | Prisma.TemplateVersionWhereInput[];
    OR?: Prisma.TemplateVersionWhereInput[];
    NOT?: Prisma.TemplateVersionWhereInput | Prisma.TemplateVersionWhereInput[];
    id?: Prisma.UuidFilter<"TemplateVersion"> | string;
    templateId?: Prisma.UuidFilter<"TemplateVersion"> | string;
    organizationId?: Prisma.StringFilter<"TemplateVersion"> | string;
    version?: Prisma.IntFilter<"TemplateVersion"> | number;
    sourceDraftRevision?: Prisma.IntFilter<"TemplateVersion"> | number;
    name?: Prisma.StringFilter<"TemplateVersion"> | string;
    description?: Prisma.StringFilter<"TemplateVersion"> | string;
    metadata?: Prisma.JsonFilter<"TemplateVersion">;
    fields?: Prisma.JsonFilter<"TemplateVersion">;
    publishedById?: Prisma.StringFilter<"TemplateVersion"> | string;
    publishedAt?: Prisma.DateTimeFilter<"TemplateVersion"> | Date | string;
    template?: Prisma.XOR<Prisma.TemplateScalarRelationFilter, Prisma.TemplateWhereInput>;
};
export type TemplateVersionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    templateId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    sourceDraftRevision?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    fields?: Prisma.SortOrder;
    publishedById?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    template?: Prisma.TemplateOrderByWithRelationInput;
};
export type TemplateVersionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    templateId_version?: Prisma.TemplateVersionTemplateIdVersionCompoundUniqueInput;
    templateId_sourceDraftRevision?: Prisma.TemplateVersionTemplateIdSourceDraftRevisionCompoundUniqueInput;
    AND?: Prisma.TemplateVersionWhereInput | Prisma.TemplateVersionWhereInput[];
    OR?: Prisma.TemplateVersionWhereInput[];
    NOT?: Prisma.TemplateVersionWhereInput | Prisma.TemplateVersionWhereInput[];
    templateId?: Prisma.UuidFilter<"TemplateVersion"> | string;
    organizationId?: Prisma.StringFilter<"TemplateVersion"> | string;
    version?: Prisma.IntFilter<"TemplateVersion"> | number;
    sourceDraftRevision?: Prisma.IntFilter<"TemplateVersion"> | number;
    name?: Prisma.StringFilter<"TemplateVersion"> | string;
    description?: Prisma.StringFilter<"TemplateVersion"> | string;
    metadata?: Prisma.JsonFilter<"TemplateVersion">;
    fields?: Prisma.JsonFilter<"TemplateVersion">;
    publishedById?: Prisma.StringFilter<"TemplateVersion"> | string;
    publishedAt?: Prisma.DateTimeFilter<"TemplateVersion"> | Date | string;
    template?: Prisma.XOR<Prisma.TemplateScalarRelationFilter, Prisma.TemplateWhereInput>;
}, "id" | "templateId_version" | "templateId_sourceDraftRevision">;
export type TemplateVersionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    templateId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    sourceDraftRevision?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    fields?: Prisma.SortOrder;
    publishedById?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    _count?: Prisma.TemplateVersionCountOrderByAggregateInput;
    _avg?: Prisma.TemplateVersionAvgOrderByAggregateInput;
    _max?: Prisma.TemplateVersionMaxOrderByAggregateInput;
    _min?: Prisma.TemplateVersionMinOrderByAggregateInput;
    _sum?: Prisma.TemplateVersionSumOrderByAggregateInput;
};
export type TemplateVersionScalarWhereWithAggregatesInput = {
    AND?: Prisma.TemplateVersionScalarWhereWithAggregatesInput | Prisma.TemplateVersionScalarWhereWithAggregatesInput[];
    OR?: Prisma.TemplateVersionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TemplateVersionScalarWhereWithAggregatesInput | Prisma.TemplateVersionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"TemplateVersion"> | string;
    templateId?: Prisma.UuidWithAggregatesFilter<"TemplateVersion"> | string;
    organizationId?: Prisma.StringWithAggregatesFilter<"TemplateVersion"> | string;
    version?: Prisma.IntWithAggregatesFilter<"TemplateVersion"> | number;
    sourceDraftRevision?: Prisma.IntWithAggregatesFilter<"TemplateVersion"> | number;
    name?: Prisma.StringWithAggregatesFilter<"TemplateVersion"> | string;
    description?: Prisma.StringWithAggregatesFilter<"TemplateVersion"> | string;
    metadata?: Prisma.JsonWithAggregatesFilter<"TemplateVersion">;
    fields?: Prisma.JsonWithAggregatesFilter<"TemplateVersion">;
    publishedById?: Prisma.StringWithAggregatesFilter<"TemplateVersion"> | string;
    publishedAt?: Prisma.DateTimeWithAggregatesFilter<"TemplateVersion"> | Date | string;
};
export type TemplateVersionCreateInput = {
    id?: string;
    version: number;
    sourceDraftRevision: number;
    name: string;
    description?: string;
    metadata: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById: string;
    publishedAt?: Date | string;
    template: Prisma.TemplateCreateNestedOneWithoutVersionsInput;
};
export type TemplateVersionUncheckedCreateInput = {
    id?: string;
    templateId: string;
    organizationId: string;
    version: number;
    sourceDraftRevision: number;
    name: string;
    description?: string;
    metadata: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById: string;
    publishedAt?: Date | string;
};
export type TemplateVersionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceDraftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    template?: Prisma.TemplateUpdateOneRequiredWithoutVersionsNestedInput;
};
export type TemplateVersionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    templateId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceDraftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateVersionCreateManyInput = {
    id?: string;
    templateId: string;
    organizationId: string;
    version: number;
    sourceDraftRevision: number;
    name: string;
    description?: string;
    metadata: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById: string;
    publishedAt?: Date | string;
};
export type TemplateVersionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceDraftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateVersionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    templateId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceDraftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateVersionListRelationFilter = {
    every?: Prisma.TemplateVersionWhereInput;
    some?: Prisma.TemplateVersionWhereInput;
    none?: Prisma.TemplateVersionWhereInput;
};
export type TemplateVersionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TemplateVersionTemplateIdVersionCompoundUniqueInput = {
    templateId: string;
    version: number;
};
export type TemplateVersionTemplateIdSourceDraftRevisionCompoundUniqueInput = {
    templateId: string;
    sourceDraftRevision: number;
};
export type TemplateVersionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    templateId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    sourceDraftRevision?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    fields?: Prisma.SortOrder;
    publishedById?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
};
export type TemplateVersionAvgOrderByAggregateInput = {
    version?: Prisma.SortOrder;
    sourceDraftRevision?: Prisma.SortOrder;
};
export type TemplateVersionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    templateId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    sourceDraftRevision?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    publishedById?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
};
export type TemplateVersionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    templateId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    sourceDraftRevision?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    publishedById?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
};
export type TemplateVersionSumOrderByAggregateInput = {
    version?: Prisma.SortOrder;
    sourceDraftRevision?: Prisma.SortOrder;
};
export type TemplateVersionCreateNestedManyWithoutTemplateInput = {
    create?: Prisma.XOR<Prisma.TemplateVersionCreateWithoutTemplateInput, Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput> | Prisma.TemplateVersionCreateWithoutTemplateInput[] | Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput[];
    connectOrCreate?: Prisma.TemplateVersionCreateOrConnectWithoutTemplateInput | Prisma.TemplateVersionCreateOrConnectWithoutTemplateInput[];
    createMany?: Prisma.TemplateVersionCreateManyTemplateInputEnvelope;
    connect?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
};
export type TemplateVersionUncheckedCreateNestedManyWithoutTemplateInput = {
    create?: Prisma.XOR<Prisma.TemplateVersionCreateWithoutTemplateInput, Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput> | Prisma.TemplateVersionCreateWithoutTemplateInput[] | Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput[];
    connectOrCreate?: Prisma.TemplateVersionCreateOrConnectWithoutTemplateInput | Prisma.TemplateVersionCreateOrConnectWithoutTemplateInput[];
    createMany?: Prisma.TemplateVersionCreateManyTemplateInputEnvelope;
    connect?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
};
export type TemplateVersionUpdateManyWithoutTemplateNestedInput = {
    create?: Prisma.XOR<Prisma.TemplateVersionCreateWithoutTemplateInput, Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput> | Prisma.TemplateVersionCreateWithoutTemplateInput[] | Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput[];
    connectOrCreate?: Prisma.TemplateVersionCreateOrConnectWithoutTemplateInput | Prisma.TemplateVersionCreateOrConnectWithoutTemplateInput[];
    upsert?: Prisma.TemplateVersionUpsertWithWhereUniqueWithoutTemplateInput | Prisma.TemplateVersionUpsertWithWhereUniqueWithoutTemplateInput[];
    createMany?: Prisma.TemplateVersionCreateManyTemplateInputEnvelope;
    set?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
    disconnect?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
    delete?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
    connect?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
    update?: Prisma.TemplateVersionUpdateWithWhereUniqueWithoutTemplateInput | Prisma.TemplateVersionUpdateWithWhereUniqueWithoutTemplateInput[];
    updateMany?: Prisma.TemplateVersionUpdateManyWithWhereWithoutTemplateInput | Prisma.TemplateVersionUpdateManyWithWhereWithoutTemplateInput[];
    deleteMany?: Prisma.TemplateVersionScalarWhereInput | Prisma.TemplateVersionScalarWhereInput[];
};
export type TemplateVersionUncheckedUpdateManyWithoutTemplateNestedInput = {
    create?: Prisma.XOR<Prisma.TemplateVersionCreateWithoutTemplateInput, Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput> | Prisma.TemplateVersionCreateWithoutTemplateInput[] | Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput[];
    connectOrCreate?: Prisma.TemplateVersionCreateOrConnectWithoutTemplateInput | Prisma.TemplateVersionCreateOrConnectWithoutTemplateInput[];
    upsert?: Prisma.TemplateVersionUpsertWithWhereUniqueWithoutTemplateInput | Prisma.TemplateVersionUpsertWithWhereUniqueWithoutTemplateInput[];
    createMany?: Prisma.TemplateVersionCreateManyTemplateInputEnvelope;
    set?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
    disconnect?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
    delete?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
    connect?: Prisma.TemplateVersionWhereUniqueInput | Prisma.TemplateVersionWhereUniqueInput[];
    update?: Prisma.TemplateVersionUpdateWithWhereUniqueWithoutTemplateInput | Prisma.TemplateVersionUpdateWithWhereUniqueWithoutTemplateInput[];
    updateMany?: Prisma.TemplateVersionUpdateManyWithWhereWithoutTemplateInput | Prisma.TemplateVersionUpdateManyWithWhereWithoutTemplateInput[];
    deleteMany?: Prisma.TemplateVersionScalarWhereInput | Prisma.TemplateVersionScalarWhereInput[];
};
export type TemplateVersionCreateWithoutTemplateInput = {
    id?: string;
    version: number;
    sourceDraftRevision: number;
    name: string;
    description?: string;
    metadata: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById: string;
    publishedAt?: Date | string;
};
export type TemplateVersionUncheckedCreateWithoutTemplateInput = {
    id?: string;
    version: number;
    sourceDraftRevision: number;
    name: string;
    description?: string;
    metadata: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById: string;
    publishedAt?: Date | string;
};
export type TemplateVersionCreateOrConnectWithoutTemplateInput = {
    where: Prisma.TemplateVersionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TemplateVersionCreateWithoutTemplateInput, Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput>;
};
export type TemplateVersionCreateManyTemplateInputEnvelope = {
    data: Prisma.TemplateVersionCreateManyTemplateInput | Prisma.TemplateVersionCreateManyTemplateInput[];
    skipDuplicates?: boolean;
};
export type TemplateVersionUpsertWithWhereUniqueWithoutTemplateInput = {
    where: Prisma.TemplateVersionWhereUniqueInput;
    update: Prisma.XOR<Prisma.TemplateVersionUpdateWithoutTemplateInput, Prisma.TemplateVersionUncheckedUpdateWithoutTemplateInput>;
    create: Prisma.XOR<Prisma.TemplateVersionCreateWithoutTemplateInput, Prisma.TemplateVersionUncheckedCreateWithoutTemplateInput>;
};
export type TemplateVersionUpdateWithWhereUniqueWithoutTemplateInput = {
    where: Prisma.TemplateVersionWhereUniqueInput;
    data: Prisma.XOR<Prisma.TemplateVersionUpdateWithoutTemplateInput, Prisma.TemplateVersionUncheckedUpdateWithoutTemplateInput>;
};
export type TemplateVersionUpdateManyWithWhereWithoutTemplateInput = {
    where: Prisma.TemplateVersionScalarWhereInput;
    data: Prisma.XOR<Prisma.TemplateVersionUpdateManyMutationInput, Prisma.TemplateVersionUncheckedUpdateManyWithoutTemplateInput>;
};
export type TemplateVersionScalarWhereInput = {
    AND?: Prisma.TemplateVersionScalarWhereInput | Prisma.TemplateVersionScalarWhereInput[];
    OR?: Prisma.TemplateVersionScalarWhereInput[];
    NOT?: Prisma.TemplateVersionScalarWhereInput | Prisma.TemplateVersionScalarWhereInput[];
    id?: Prisma.UuidFilter<"TemplateVersion"> | string;
    templateId?: Prisma.UuidFilter<"TemplateVersion"> | string;
    organizationId?: Prisma.StringFilter<"TemplateVersion"> | string;
    version?: Prisma.IntFilter<"TemplateVersion"> | number;
    sourceDraftRevision?: Prisma.IntFilter<"TemplateVersion"> | number;
    name?: Prisma.StringFilter<"TemplateVersion"> | string;
    description?: Prisma.StringFilter<"TemplateVersion"> | string;
    metadata?: Prisma.JsonFilter<"TemplateVersion">;
    fields?: Prisma.JsonFilter<"TemplateVersion">;
    publishedById?: Prisma.StringFilter<"TemplateVersion"> | string;
    publishedAt?: Prisma.DateTimeFilter<"TemplateVersion"> | Date | string;
};
export type TemplateVersionCreateManyTemplateInput = {
    id?: string;
    version: number;
    sourceDraftRevision: number;
    name: string;
    description?: string;
    metadata: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById: string;
    publishedAt?: Date | string;
};
export type TemplateVersionUpdateWithoutTemplateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceDraftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateVersionUncheckedUpdateWithoutTemplateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceDraftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateVersionUncheckedUpdateManyWithoutTemplateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceDraftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    publishedById?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateVersionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    templateId?: boolean;
    organizationId?: boolean;
    version?: boolean;
    sourceDraftRevision?: boolean;
    name?: boolean;
    description?: boolean;
    metadata?: boolean;
    fields?: boolean;
    publishedById?: boolean;
    publishedAt?: boolean;
    template?: boolean | Prisma.TemplateDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["templateVersion"]>;
export type TemplateVersionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    templateId?: boolean;
    organizationId?: boolean;
    version?: boolean;
    sourceDraftRevision?: boolean;
    name?: boolean;
    description?: boolean;
    metadata?: boolean;
    fields?: boolean;
    publishedById?: boolean;
    publishedAt?: boolean;
    template?: boolean | Prisma.TemplateDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["templateVersion"]>;
export type TemplateVersionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    templateId?: boolean;
    organizationId?: boolean;
    version?: boolean;
    sourceDraftRevision?: boolean;
    name?: boolean;
    description?: boolean;
    metadata?: boolean;
    fields?: boolean;
    publishedById?: boolean;
    publishedAt?: boolean;
    template?: boolean | Prisma.TemplateDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["templateVersion"]>;
export type TemplateVersionSelectScalar = {
    id?: boolean;
    templateId?: boolean;
    organizationId?: boolean;
    version?: boolean;
    sourceDraftRevision?: boolean;
    name?: boolean;
    description?: boolean;
    metadata?: boolean;
    fields?: boolean;
    publishedById?: boolean;
    publishedAt?: boolean;
};
export type TemplateVersionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "templateId" | "organizationId" | "version" | "sourceDraftRevision" | "name" | "description" | "metadata" | "fields" | "publishedById" | "publishedAt", ExtArgs["result"]["templateVersion"]>;
export type TemplateVersionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    template?: boolean | Prisma.TemplateDefaultArgs<ExtArgs>;
};
export type TemplateVersionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    template?: boolean | Prisma.TemplateDefaultArgs<ExtArgs>;
};
export type TemplateVersionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    template?: boolean | Prisma.TemplateDefaultArgs<ExtArgs>;
};
export type $TemplateVersionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TemplateVersion";
    objects: {
        template: Prisma.$TemplatePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        templateId: string;
        organizationId: string;
        version: number;
        sourceDraftRevision: number;
        name: string;
        description: string;
        metadata: runtime.JsonValue;
        fields: runtime.JsonValue;
        publishedById: string;
        publishedAt: Date;
    }, ExtArgs["result"]["templateVersion"]>;
    composites: {};
};
export type TemplateVersionGetPayload<S extends boolean | null | undefined | TemplateVersionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload, S>;
export type TemplateVersionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TemplateVersionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TemplateVersionCountAggregateInputType | true;
};
export interface TemplateVersionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TemplateVersion'];
        meta: {
            name: 'TemplateVersion';
        };
    };
    findUnique<T extends TemplateVersionFindUniqueArgs>(args: Prisma.SelectSubset<T, TemplateVersionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TemplateVersionClient<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TemplateVersionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TemplateVersionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TemplateVersionClient<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TemplateVersionFindFirstArgs>(args?: Prisma.SelectSubset<T, TemplateVersionFindFirstArgs<ExtArgs>>): Prisma.Prisma__TemplateVersionClient<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TemplateVersionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TemplateVersionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TemplateVersionClient<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TemplateVersionFindManyArgs>(args?: Prisma.SelectSubset<T, TemplateVersionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TemplateVersionCreateArgs>(args: Prisma.SelectSubset<T, TemplateVersionCreateArgs<ExtArgs>>): Prisma.Prisma__TemplateVersionClient<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TemplateVersionCreateManyArgs>(args?: Prisma.SelectSubset<T, TemplateVersionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TemplateVersionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TemplateVersionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TemplateVersionDeleteArgs>(args: Prisma.SelectSubset<T, TemplateVersionDeleteArgs<ExtArgs>>): Prisma.Prisma__TemplateVersionClient<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TemplateVersionUpdateArgs>(args: Prisma.SelectSubset<T, TemplateVersionUpdateArgs<ExtArgs>>): Prisma.Prisma__TemplateVersionClient<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TemplateVersionDeleteManyArgs>(args?: Prisma.SelectSubset<T, TemplateVersionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TemplateVersionUpdateManyArgs>(args: Prisma.SelectSubset<T, TemplateVersionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TemplateVersionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TemplateVersionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TemplateVersionUpsertArgs>(args: Prisma.SelectSubset<T, TemplateVersionUpsertArgs<ExtArgs>>): Prisma.Prisma__TemplateVersionClient<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TemplateVersionCountArgs>(args?: Prisma.Subset<T, TemplateVersionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TemplateVersionCountAggregateOutputType> : number>;
    aggregate<T extends TemplateVersionAggregateArgs>(args: Prisma.Subset<T, TemplateVersionAggregateArgs>): Prisma.PrismaPromise<GetTemplateVersionAggregateType<T>>;
    groupBy<T extends TemplateVersionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TemplateVersionGroupByArgs['orderBy'];
    } : {
        orderBy?: TemplateVersionGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TemplateVersionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTemplateVersionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TemplateVersionFieldRefs;
}
export interface Prisma__TemplateVersionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    template<T extends Prisma.TemplateDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TemplateDefaultArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TemplateVersionFieldRefs {
    readonly id: Prisma.FieldRef<"TemplateVersion", 'String'>;
    readonly templateId: Prisma.FieldRef<"TemplateVersion", 'String'>;
    readonly organizationId: Prisma.FieldRef<"TemplateVersion", 'String'>;
    readonly version: Prisma.FieldRef<"TemplateVersion", 'Int'>;
    readonly sourceDraftRevision: Prisma.FieldRef<"TemplateVersion", 'Int'>;
    readonly name: Prisma.FieldRef<"TemplateVersion", 'String'>;
    readonly description: Prisma.FieldRef<"TemplateVersion", 'String'>;
    readonly metadata: Prisma.FieldRef<"TemplateVersion", 'Json'>;
    readonly fields: Prisma.FieldRef<"TemplateVersion", 'Json'>;
    readonly publishedById: Prisma.FieldRef<"TemplateVersion", 'String'>;
    readonly publishedAt: Prisma.FieldRef<"TemplateVersion", 'DateTime'>;
}
export type TemplateVersionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
    where: Prisma.TemplateVersionWhereUniqueInput;
};
export type TemplateVersionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
    where: Prisma.TemplateVersionWhereUniqueInput;
};
export type TemplateVersionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
    where?: Prisma.TemplateVersionWhereInput;
    orderBy?: Prisma.TemplateVersionOrderByWithRelationInput | Prisma.TemplateVersionOrderByWithRelationInput[];
    cursor?: Prisma.TemplateVersionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TemplateVersionScalarFieldEnum | Prisma.TemplateVersionScalarFieldEnum[];
};
export type TemplateVersionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
    where?: Prisma.TemplateVersionWhereInput;
    orderBy?: Prisma.TemplateVersionOrderByWithRelationInput | Prisma.TemplateVersionOrderByWithRelationInput[];
    cursor?: Prisma.TemplateVersionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TemplateVersionScalarFieldEnum | Prisma.TemplateVersionScalarFieldEnum[];
};
export type TemplateVersionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
    where?: Prisma.TemplateVersionWhereInput;
    orderBy?: Prisma.TemplateVersionOrderByWithRelationInput | Prisma.TemplateVersionOrderByWithRelationInput[];
    cursor?: Prisma.TemplateVersionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TemplateVersionScalarFieldEnum | Prisma.TemplateVersionScalarFieldEnum[];
};
export type TemplateVersionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TemplateVersionCreateInput, Prisma.TemplateVersionUncheckedCreateInput>;
};
export type TemplateVersionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TemplateVersionCreateManyInput | Prisma.TemplateVersionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TemplateVersionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    data: Prisma.TemplateVersionCreateManyInput | Prisma.TemplateVersionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TemplateVersionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TemplateVersionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TemplateVersionUpdateInput, Prisma.TemplateVersionUncheckedUpdateInput>;
    where: Prisma.TemplateVersionWhereUniqueInput;
};
export type TemplateVersionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TemplateVersionUpdateManyMutationInput, Prisma.TemplateVersionUncheckedUpdateManyInput>;
    where?: Prisma.TemplateVersionWhereInput;
    limit?: number;
};
export type TemplateVersionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TemplateVersionUpdateManyMutationInput, Prisma.TemplateVersionUncheckedUpdateManyInput>;
    where?: Prisma.TemplateVersionWhereInput;
    limit?: number;
    include?: Prisma.TemplateVersionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TemplateVersionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
    where: Prisma.TemplateVersionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TemplateVersionCreateInput, Prisma.TemplateVersionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TemplateVersionUpdateInput, Prisma.TemplateVersionUncheckedUpdateInput>;
};
export type TemplateVersionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
    where: Prisma.TemplateVersionWhereUniqueInput;
};
export type TemplateVersionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateVersionWhereInput;
    limit?: number;
};
export type TemplateVersionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateVersionSelect<ExtArgs> | null;
    omit?: Prisma.TemplateVersionOmit<ExtArgs> | null;
    include?: Prisma.TemplateVersionInclude<ExtArgs> | null;
};
