export class RepositoryParent {

    protected environment:string;

    protected region:string;

    protected tableName:string;

    public constructor(environment:string, region:string, tableName:string) {  
        this.environment = environment;
        this.region = region;
        this.tableName = tableName + this.environment;
    }

}