package com.fcp.ne.dto;

public class FCPresultDTO {
    private int numOfTrans; //trans
    private int outputCount; // FCP
    private int numOfFItem; // FCP 1-itemset

    public FCPresultDTO(int numOfTrans, int numOfFItem, int outputCount) {
        this.numOfTrans = numOfTrans;
        this.numOfFItem = numOfFItem;
        this.outputCount = outputCount;
    }

    public int getNumOfTrans() {
        return numOfTrans;
    }

    public int getOutputCount() {
        return outputCount;
    }

    public int getNumOfFItem() {
        return numOfFItem;
    }

    @Override
    public String toString() {
        return "FCPresultDTO{" +
                "numOfTrans=" + numOfTrans +
                ", outputCount=" + outputCount +
                ", numOfFItem=" + numOfFItem +
                '}';
    }
}
