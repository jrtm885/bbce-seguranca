export class ConsumerParent {

    protected environment:string;

    protected region:string;

    protected queueUrl:string;

    public constructor(environment:string, region:string, queueUrl:string) {  
        this.environment = environment;
        this.region = region;
        this.queueUrl = queueUrl;
    }

}