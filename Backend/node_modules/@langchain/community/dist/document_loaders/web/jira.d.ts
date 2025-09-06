import { Document } from "@langchain/core/documents";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
export type JiraStatusCategory = {
    self: string;
    id: number;
    key: string;
    colorName: string;
    name: string;
};
export type JiraStatus = {
    self: string;
    description: string;
    iconUrl: string;
    name: string;
    id: string;
    statusCategory: JiraStatusCategory;
};
export type JiraUser = {
    accountId: string;
    accountType: string;
    active: boolean;
    avatarUrls: {
        "16x16": string;
        "24x24": string;
        "32x32": string;
        "48x48": string;
    };
    displayName: string;
    emailAddress: string;
    self: string;
    timeZone: string;
};
export type JiraIssueType = {
    avatarId: number;
    description: string;
    entityId: string;
    hierarchyLevel: number;
    iconUrl: string;
    id: string;
    name: string;
    self: string;
    subtask: boolean;
};
export type JiraPriority = {
    iconUrl: string;
    id: string;
    name: string;
    self: string;
};
export type JiraProgress = {
    progress: number;
    total: number;
    percent?: number;
};
export type JiraProject = {
    avatarUrls: {
        "16x16": string;
        "24x24": string;
        "32x32": string;
        "48x48": string;
    };
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
    self: string;
    simplified: boolean;
};
export type JiraSubTask = {
    id: string;
    key: string;
    self: string;
    fields: {
        issuetype: JiraIssueType;
        priority: JiraPriority;
        status: JiraStatus;
        summary: string;
    };
};
export type JiraIssueLinkType = {
    id: string;
    name: string;
    inward: string;
    outward: string;
    self: string;
};
export type JiraBriefIssue = {
    id: string;
    key: string;
    self: string;
    fields: {
        summary: string;
        status: JiraStatus;
        priority: JiraPriority;
        issuetype: JiraIssueType;
    };
};
export type JiraIssueLink = {
    id: string;
    self: string;
    type: JiraIssueLinkType;
    inwardIssue?: JiraBriefIssue;
    outwardIssue?: JiraBriefIssue;
};
export type JiraIssue = {
    expand: string;
    id: string;
    self: string;
    key: string;
    fields: {
        assignee?: JiraUser;
        created: string;
        description: string;
        issuelinks: JiraIssueLink[];
        issuetype: JiraIssueType;
        labels?: string[];
        priority: JiraPriority;
        progress: JiraProgress;
        project: JiraProject;
        reporter?: JiraUser;
        creator: JiraUser;
        resolutiondate?: string;
        status: JiraStatus;
        subtasks: JiraSubTask[];
        summary: string;
        timeestimate?: number;
        timespent?: number;
        updated: string;
        duedate?: string;
        parent?: JiraBriefIssue;
    };
};
export type JiraAPIResponse = {
    expand: string;
    startAt: number;
    maxResults: number;
    total: number;
    issues: JiraIssue[];
};
/**
 * Interface representing the parameters for configuring the
 * JiraDocumentConverter.
 */
export interface JiraDocumentConverterParams {
    host: string;
    projectKey: string;
}
/**
 * Class responsible for converting Jira issues to Document objects
 */
export declare class JiraDocumentConverter {
    readonly host: string;
    readonly projectKey: string;
    constructor({ host, projectKey }: JiraDocumentConverterParams);
    convertToDocuments(issues: JiraIssue[]): Document[];
    private documentFromIssue;
    private formatIssueInfo;
    private getLinkToIssue;
    private formatMainIssueInfoText;
}
/**
 * Interface representing the parameters for configuring the
 * JiraProjectLoader.
 */
export interface JiraProjectLoaderParams {
    host: string;
    projectKey: string;
    username: string;
    accessToken: string;
    limitPerRequest?: number;
    createdAfter?: Date;
}
/**
 * Class representing a document loader for loading pages from Confluence.
 */
export declare class JiraProjectLoader extends BaseDocumentLoader {
    private readonly accessToken;
    readonly host: string;
    readonly projectKey: string;
    readonly username: string;
    readonly limitPerRequest: number;
    private readonly createdAfter?;
    private readonly documentConverter;
    constructor({ host, projectKey, username, accessToken, limitPerRequest, createdAfter, }: JiraProjectLoaderParams);
    private buildAuthorizationHeader;
    load(): Promise<Document[]>;
    loadAsIssues(): Promise<JiraIssue[]>;
    protected toJiraDateString(date: Date | undefined): string | undefined;
    protected fetchIssues(): AsyncIterable<JiraIssue[]>;
}
