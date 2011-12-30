package com.mierdasoft.bowlpoolmanager.model;

import java.util.*;

public class Pool {
	private String name;

	private List<Bowl> bowls;

	private List<Player> players;

	private Map<Player, List<Pick>> pickMap;

	private UUID id;

	public Pool() {
		this.name = "Unnamed Bowl";
		
		this.init();
	}

	public Pool(String name) {
		this.name = name;

		this.init();
	}

	public void addBowl(Bowl bowl) {
		this.bowls.add(bowl);
	}

	public void addPick(Player player, Pick pick) {
		List<Pick> picks;

		picks = this.pickMap.get(player);

		if (picks != null)
			picks.add(pick);
	}

	public void addPlayer(Player Player) {
		this.players.add(Player);
	}

	public UUID getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public List<Pick> getPicksForPlayer(Player player) {
		return this.pickMap.get(player);
	}

	private void init() {
		this.bowls = new ArrayList<Bowl>();

		this.players = new ArrayList<Player>();

		this.pickMap = new HashMap<Player, List<Pick>>();

		this.id = UUID.randomUUID();
	}

	public void removeBowl(Bowl bowl) {
		this.bowls.remove(bowl);
	}

	public void removePick(Player player, Pick pick) {
		List<Pick> picks;

		picks = this.pickMap.get(player);

		if (picks != null)
			picks.remove(pick);
	}

	public void removePlayer(Player Player) {
		this.players.remove(Player);
	}
}
