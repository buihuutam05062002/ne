package com.fcp.ne.mapping;

import java.util.List;

public class Itemset {
	private List<Integer> items;
	private int support;

	public Itemset(List<Integer> items, int support) {
		this.items = items;
		this.support = support;
	}

	public List<Integer> getItems() {
		return items;
	}

	public int getSupport() {
		return support;
	}

	@Override
	public String toString() {
		return items + " #SUP: " + support;
	}
}
