import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TemplateModel = runtime.Types.Result.DefaultSelection<Prisma.$TemplatePayload>;
export type AggregateTemplate = {
    _count: TemplateCountAggregateOutputType | null;
    _avg: TemplateAvgAggregateOutputType | null;
    _sum: TemplateSumAggregateOutputType | null;
    _min: TemplateMinAggregateOutputType | null;
    _max: TemplateMaxAggregateOutputType | null;
};
export type TemplateAvgAggregateOutputType = {
    draftRevision: number | null;
};
export type TemplateSumAggregateOutputType = {
    draftRevision: number | null;
};
export type TemplateMinAggregateOutputType = {
    id: string | null;
    organizationId: string | null;
    createdById: string | null;
    name: string | null;
    description: string | null;
    draftRevision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TemplateMaxAggregateOutputType = {
    id: string | null;
    organizationId: string | null;
    createdById: string | null;
    name: string | null;
    description: string | null;
    draftRevision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TemplateCountAggregateOutputType = {
    id: number;
    organizationId: number;
    createdById: number;
    name: number;
    description: number;
    metadata: number;
    fields: number;
    draftRevision: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TemplateAvgAggregateInputType = {
    draftRevision?: true;
};
export type TemplateSumAggregateInputType = {
    draftRevision?: true;
};
export type TemplateMinAggregateInputType = {
    id?: true;
    organizationId?: true;
    createdById?: true;
    name?: true;
    description?: true;
    draftRevision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TemplateMaxAggregateInputType = {
    id?: true;
    organizationId?: true;
    createdById?: true;
    name?: true;
    description?: true;
    draftRevision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TemplateCountAggregateInputType = {
    id?: true;
    organizationId?: true;
    createdById?: true;
    name?: true;
    description?: true;
    metadata?: true;
    fields?: true;
    draftRevision?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TemplateAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithRelationInput | Prisma.TemplateOrderByWithRelationInput[];
    cursor?: Prisma.TemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TemplateCountAggregateInputType;
    _avg?: TemplateAvgAggregateInputType;
    _sum?: TemplateSumAggregateInputType;
    _min?: TemplateMinAggregateInputType;
    _max?: TemplateMaxAggregateInputType;
};
export type GetTemplateAggregateType<T extends TemplateAggregateArgs> = {
    [P in keyof T & keyof AggregateTemplate]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTemplate[P]> : Prisma.GetScalarType<T[P], AggregateTemplate[P]>;
};
export type TemplateGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithAggregationInput | Prisma.TemplateOrderByWithAggregationInput[];
    by: Prisma.TemplateScalarFieldEnum[] | Prisma.TemplateScalarFieldEnum;
    having?: Prisma.TemplateScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TemplateCountAggregateInputType | true;
    _avg?: TemplateAvgAggregateInputType;
    _sum?: TemplateSumAggregateInputType;
    _min?: TemplateMinAggregateInputType;
    _max?: TemplateMaxAggregateInputType;
};
export type TemplateGroupByOutputType = {
    id: string;
    organizationId: string;
    createdById: string;
    name: string;
    description: string;
    metadata: runtime.JsonValue;
    fields: runtime.JsonValue;
    draftRevision: number;
    createdAt: Date;
    updatedAt: Date;
    _count: TemplateCountAggregateOutputType | null;
    _avg: TemplateAvgAggregateOutputType | null;
    _sum: TemplateSumAggregateOutputType | null;
    _min: TemplateMinAggregateOutputType | null;
    _max: TemplateMaxAggregateOutputType | null;
};
export type GetTemplateGroupByPayload<T extends TemplateGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TemplateGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TemplateGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TemplateGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TemplateGroupByOutputType[P]>;
}>>;
export type TemplateWhereInput = {
    AND?: Prisma.TemplateWhereInput | Prisma.TemplateWhereInput[];
    OR?: Prisma.TemplateWhereInput[];
    NOT?: Prisma.TemplateWhereInput | Prisma.TemplateWhereInput[];
    id?: Prisma.UuidFilter<"Template"> | string;
    organizationId?: Prisma.StringFilter<"Template"> | string;
    createdById?: Prisma.StringFilter<"Template"> | string;
    name?: Prisma.StringFilter<"Template"> | string;
    description?: Prisma.StringFilter<"Template"> | string;
    metadata?: Prisma.JsonFilter<"Template">;
    fields?: Prisma.JsonFilter<"Template">;
    draftRevision?: Prisma.IntFilter<"Template"> | number;
    createdAt?: Prisma.DateTimeFilter<"Template"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Template"> | Date | string;
    versions?: Prisma.TemplateVersionListRelationFilter;
};
export type TemplateOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    fields?: Prisma.SortOrder;
    draftRevision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    versions?: Prisma.TemplateVersionOrderByRelationAggregateInput;
};
export type TemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    id_organizationId?: Prisma.TemplateIdOrganizationIdCompoundUniqueInput;
    AND?: Prisma.TemplateWhereInput | Prisma.TemplateWhereInput[];
    OR?: Prisma.TemplateWhereInput[];
    NOT?: Prisma.TemplateWhereInput | Prisma.TemplateWhereInput[];
    organizationId?: Prisma.StringFilter<"Template"> | string;
    createdById?: Prisma.StringFilter<"Template"> | string;
    name?: Prisma.StringFilter<"Template"> | string;
    description?: Prisma.StringFilter<"Template"> | string;
    metadata?: Prisma.JsonFilter<"Template">;
    fields?: Prisma.JsonFilter<"Template">;
    draftRevision?: Prisma.IntFilter<"Template"> | number;
    createdAt?: Prisma.DateTimeFilter<"Template"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Template"> | Date | string;
    versions?: Prisma.TemplateVersionListRelationFilter;
}, "id" | "id_organizationId">;
export type TemplateOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    fields?: Prisma.SortOrder;
    draftRevision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TemplateCountOrderByAggregateInput;
    _avg?: Prisma.TemplateAvgOrderByAggregateInput;
    _max?: Prisma.TemplateMaxOrderByAggregateInput;
    _min?: Prisma.TemplateMinOrderByAggregateInput;
    _sum?: Prisma.TemplateSumOrderByAggregateInput;
};
export type TemplateScalarWhereWithAggregatesInput = {
    AND?: Prisma.TemplateScalarWhereWithAggregatesInput | Prisma.TemplateScalarWhereWithAggregatesInput[];
    OR?: Prisma.TemplateScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TemplateScalarWhereWithAggregatesInput | Prisma.TemplateScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Template"> | string;
    organizationId?: Prisma.StringWithAggregatesFilter<"Template"> | string;
    createdById?: Prisma.StringWithAggregatesFilter<"Template"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Template"> | string;
    description?: Prisma.StringWithAggregatesFilter<"Template"> | string;
    metadata?: Prisma.JsonWithAggregatesFilter<"Template">;
    fields?: Prisma.JsonWithAggregatesFilter<"Template">;
    draftRevision?: Prisma.IntWithAggregatesFilter<"Template"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Template"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Template"> | Date | string;
};
export type TemplateCreateInput = {
    id?: string;
    organizationId: string;
    createdById: string;
    name: string;
    description?: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    versions?: Prisma.TemplateVersionCreateNestedManyWithoutTemplateInput;
};
export type TemplateUncheckedCreateInput = {
    id?: string;
    organizationId: string;
    createdById: string;
    name: string;
    description?: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    versions?: Prisma.TemplateVersionUncheckedCreateNestedManyWithoutTemplateInput;
};
export type TemplateUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    versions?: Prisma.TemplateVersionUpdateManyWithoutTemplateNestedInput;
};
export type TemplateUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    versions?: Prisma.TemplateVersionUncheckedUpdateManyWithoutTemplateNestedInput;
};
export type TemplateCreateManyInput = {
    id?: string;
    organizationId: string;
    createdById: string;
    name: string;
    description?: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TemplateUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateIdOrganizationIdCompoundUniqueInput = {
    id: string;
    organizationId: string;
};
export type TemplateCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    fields?: Prisma.SortOrder;
    draftRevision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TemplateAvgOrderByAggregateInput = {
    draftRevision?: Prisma.SortOrder;
};
export type TemplateMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    draftRevision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TemplateMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    draftRevision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TemplateSumOrderByAggregateInput = {
    draftRevision?: Prisma.SortOrder;
};
export type TemplateScalarRelationFilter = {
    is?: Prisma.TemplateWhereInput;
    isNot?: Prisma.TemplateWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type TemplateCreateNestedOneWithoutVersionsInput = {
    create?: Prisma.XOR<Prisma.TemplateCreateWithoutVersionsInput, Prisma.TemplateUncheckedCreateWithoutVersionsInput>;
    connectOrCreate?: Prisma.TemplateCreateOrConnectWithoutVersionsInput;
    connect?: Prisma.TemplateWhereUniqueInput;
};
export type TemplateUpdateOneRequiredWithoutVersionsNestedInput = {
    create?: Prisma.XOR<Prisma.TemplateCreateWithoutVersionsInput, Prisma.TemplateUncheckedCreateWithoutVersionsInput>;
    connectOrCreate?: Prisma.TemplateCreateOrConnectWithoutVersionsInput;
    upsert?: Prisma.TemplateUpsertWithoutVersionsInput;
    connect?: Prisma.TemplateWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TemplateUpdateToOneWithWhereWithoutVersionsInput, Prisma.TemplateUpdateWithoutVersionsInput>, Prisma.TemplateUncheckedUpdateWithoutVersionsInput>;
};
export type TemplateCreateWithoutVersionsInput = {
    id?: string;
    organizationId: string;
    createdById: string;
    name: string;
    description?: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TemplateUncheckedCreateWithoutVersionsInput = {
    id?: string;
    organizationId: string;
    createdById: string;
    name: string;
    description?: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TemplateCreateOrConnectWithoutVersionsInput = {
    where: Prisma.TemplateWhereUniqueInput;
    create: Prisma.XOR<Prisma.TemplateCreateWithoutVersionsInput, Prisma.TemplateUncheckedCreateWithoutVersionsInput>;
};
export type TemplateUpsertWithoutVersionsInput = {
    update: Prisma.XOR<Prisma.TemplateUpdateWithoutVersionsInput, Prisma.TemplateUncheckedUpdateWithoutVersionsInput>;
    create: Prisma.XOR<Prisma.TemplateCreateWithoutVersionsInput, Prisma.TemplateUncheckedCreateWithoutVersionsInput>;
    where?: Prisma.TemplateWhereInput;
};
export type TemplateUpdateToOneWithWhereWithoutVersionsInput = {
    where?: Prisma.TemplateWhereInput;
    data: Prisma.XOR<Prisma.TemplateUpdateWithoutVersionsInput, Prisma.TemplateUncheckedUpdateWithoutVersionsInput>;
};
export type TemplateUpdateWithoutVersionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateUncheckedUpdateWithoutVersionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fields?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    draftRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TemplateCountOutputType = {
    versions: number;
};
export type TemplateCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    versions?: boolean | TemplateCountOutputTypeCountVersionsArgs;
};
export type TemplateCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateCountOutputTypeSelect<ExtArgs> | null;
};
export type TemplateCountOutputTypeCountVersionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateVersionWhereInput;
};
export type TemplateSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    organizationId?: boolean;
    createdById?: boolean;
    name?: boolean;
    description?: boolean;
    metadata?: boolean;
    fields?: boolean;
    draftRevision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    versions?: boolean | Prisma.Template$versionsArgs<ExtArgs>;
    _count?: boolean | Prisma.TemplateCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["template"]>;
export type TemplateSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    organizationId?: boolean;
    createdById?: boolean;
    name?: boolean;
    description?: boolean;
    metadata?: boolean;
    fields?: boolean;
    draftRevision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["template"]>;
export type TemplateSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    organizationId?: boolean;
    createdById?: boolean;
    name?: boolean;
    description?: boolean;
    metadata?: boolean;
    fields?: boolean;
    draftRevision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["template"]>;
export type TemplateSelectScalar = {
    id?: boolean;
    organizationId?: boolean;
    createdById?: boolean;
    name?: boolean;
    description?: boolean;
    metadata?: boolean;
    fields?: boolean;
    draftRevision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TemplateOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "organizationId" | "createdById" | "name" | "description" | "metadata" | "fields" | "draftRevision" | "createdAt" | "updatedAt", ExtArgs["result"]["template"]>;
export type TemplateInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    versions?: boolean | Prisma.Template$versionsArgs<ExtArgs>;
    _count?: boolean | Prisma.TemplateCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TemplateIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type TemplateIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $TemplatePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Template";
    objects: {
        versions: Prisma.$TemplateVersionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        organizationId: string;
        createdById: string;
        name: string;
        description: string;
        metadata: runtime.JsonValue;
        fields: runtime.JsonValue;
        draftRevision: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["template"]>;
    composites: {};
};
export type TemplateGetPayload<S extends boolean | null | undefined | TemplateDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TemplatePayload, S>;
export type TemplateCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TemplateCountAggregateInputType | true;
};
export interface TemplateDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Template'];
        meta: {
            name: 'Template';
        };
    };
    findUnique<T extends TemplateFindUniqueArgs>(args: Prisma.SelectSubset<T, TemplateFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TemplateFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TemplateFindFirstArgs>(args?: Prisma.SelectSubset<T, TemplateFindFirstArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TemplateFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TemplateFindManyArgs>(args?: Prisma.SelectSubset<T, TemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TemplateCreateArgs>(args: Prisma.SelectSubset<T, TemplateCreateArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TemplateCreateManyArgs>(args?: Prisma.SelectSubset<T, TemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TemplateCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TemplateDeleteArgs>(args: Prisma.SelectSubset<T, TemplateDeleteArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TemplateUpdateArgs>(args: Prisma.SelectSubset<T, TemplateUpdateArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TemplateDeleteManyArgs>(args?: Prisma.SelectSubset<T, TemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TemplateUpdateManyArgs>(args: Prisma.SelectSubset<T, TemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TemplateUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TemplateUpsertArgs>(args: Prisma.SelectSubset<T, TemplateUpsertArgs<ExtArgs>>): Prisma.Prisma__TemplateClient<runtime.Types.Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TemplateCountArgs>(args?: Prisma.Subset<T, TemplateCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TemplateCountAggregateOutputType> : number>;
    aggregate<T extends TemplateAggregateArgs>(args: Prisma.Subset<T, TemplateAggregateArgs>): Prisma.PrismaPromise<GetTemplateAggregateType<T>>;
    groupBy<T extends TemplateGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TemplateGroupByArgs['orderBy'];
    } : {
        orderBy?: TemplateGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TemplateFieldRefs;
}
export interface Prisma__TemplateClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    versions<T extends Prisma.Template$versionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Template$versionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TemplateVersionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TemplateFieldRefs {
    readonly id: Prisma.FieldRef<"Template", 'String'>;
    readonly organizationId: Prisma.FieldRef<"Template", 'String'>;
    readonly createdById: Prisma.FieldRef<"Template", 'String'>;
    readonly name: Prisma.FieldRef<"Template", 'String'>;
    readonly description: Prisma.FieldRef<"Template", 'String'>;
    readonly metadata: Prisma.FieldRef<"Template", 'Json'>;
    readonly fields: Prisma.FieldRef<"Template", 'Json'>;
    readonly draftRevision: Prisma.FieldRef<"Template", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"Template", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Template", 'DateTime'>;
}
export type TemplateFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
    where: Prisma.TemplateWhereUniqueInput;
};
export type TemplateFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
    where: Prisma.TemplateWhereUniqueInput;
};
export type TemplateFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithRelationInput | Prisma.TemplateOrderByWithRelationInput[];
    cursor?: Prisma.TemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TemplateScalarFieldEnum | Prisma.TemplateScalarFieldEnum[];
};
export type TemplateFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithRelationInput | Prisma.TemplateOrderByWithRelationInput[];
    cursor?: Prisma.TemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TemplateScalarFieldEnum | Prisma.TemplateScalarFieldEnum[];
};
export type TemplateFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
    where?: Prisma.TemplateWhereInput;
    orderBy?: Prisma.TemplateOrderByWithRelationInput | Prisma.TemplateOrderByWithRelationInput[];
    cursor?: Prisma.TemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TemplateScalarFieldEnum | Prisma.TemplateScalarFieldEnum[];
};
export type TemplateCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TemplateCreateInput, Prisma.TemplateUncheckedCreateInput>;
};
export type TemplateCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TemplateCreateManyInput | Prisma.TemplateCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TemplateCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    data: Prisma.TemplateCreateManyInput | Prisma.TemplateCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TemplateUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TemplateUpdateInput, Prisma.TemplateUncheckedUpdateInput>;
    where: Prisma.TemplateWhereUniqueInput;
};
export type TemplateUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TemplateUpdateManyMutationInput, Prisma.TemplateUncheckedUpdateManyInput>;
    where?: Prisma.TemplateWhereInput;
    limit?: number;
};
export type TemplateUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TemplateUpdateManyMutationInput, Prisma.TemplateUncheckedUpdateManyInput>;
    where?: Prisma.TemplateWhereInput;
    limit?: number;
};
export type TemplateUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
    where: Prisma.TemplateWhereUniqueInput;
    create: Prisma.XOR<Prisma.TemplateCreateInput, Prisma.TemplateUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TemplateUpdateInput, Prisma.TemplateUncheckedUpdateInput>;
};
export type TemplateDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
    where: Prisma.TemplateWhereUniqueInput;
};
export type TemplateDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TemplateWhereInput;
    limit?: number;
};
export type Template$versionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TemplateDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TemplateSelect<ExtArgs> | null;
    omit?: Prisma.TemplateOmit<ExtArgs> | null;
    include?: Prisma.TemplateInclude<ExtArgs> | null;
};
