/**
 * Throw class.
 *
 * A Throw consists of 3 darts (there's probably a better term for this but I don't know darts that well).
 *
 * This is the data structure which is looped-through to form the rows of the results tables.
 */
class Throw {
  /**
   * @constructor
   *
   * @param {number} id The integer ID of the Throw.
   * @param {string} d1 The ID of the dart board section that has been hit by the first dart.
   * @param {string} d2 The ID of the dart board section that has been hit by the second dart.
   * @param {string} d3 The ID of the dart board section that has been hit by the third dart.
   * @param {number} total The current total value of the Throw.
   * @param {number} currentScore The total current score of the game during this Throw.
   */
  constructor(id, d1, d2, d3, total, currentScore) {
    /**
     * @type {number}
     */
    this.id = id;

    /**
     * @type {Object.<string>}
     */
    this.darts = {
      one: d1,
      two: d2,
      three: d3,
    };

    /**
     * @type {number}
     */
    this.total = total;

    /**
     * @type {number}
     */
    this.currentScore = currentScore;
  }

  /**
   * Gets the numerical value of the dart position based on the ID.
   *
   * 1. Return 0 if there's no ID passed in.
   * 2. Return the values for a bullseye or outer bullseye if the ID matches.
   * 3. Get the modifier value (1 for a single, 2 for a double and 3 for a trebble).
   * 4. Return the value of the segment multiplied by the modifier.
   *
   * @param {string} id The ID of the section of the dartboard that's been hit.
   *
   * @return {number} The integer value of the section of the dartboard that's been hit.
   */
  getDartValueFromID(id) {
    if (!id) return 0;

    // [2]
    if (id == "Bull") return 50;
    if (id == "Outer") return 25;

    // [3]
    let mod = 0;
    switch (id[0]) {
      case "s":
        mod = 1;
        break;
      case "d":
        mod = 2;
        break;
      case "t":
        mod = 3;
        break;
      default:
        mod = 1;
    }

    // [4]
    return mod * parseInt(id.substr(1));
  }

  /**
   * Calculates the total value of each of the darts in the Throw and assigns it to the Throw.total.
   */
  calculateTotal() {
    this.total = [this.darts.one, this.darts.two, this.darts.three]
      .map((dart) => this.getDartValueFromID(dart))
      .reduce((a, b) => a + b, 0);
  }

  /**
   * Calculates the current score during the current Throw and assigns it to the Throw.currentScore.
   *
   * @param {number} prevCurrentScore The current score as of the end of the previous Throw.
   * @param {string} id The ID of the section of the dartboard that has been hit.
   *
   * @return {number} The up-to-date current score.
   */
  calculateCurrentScore(prevCurrentScore, id) {
    this.currentScore = prevCurrentScore - this.getDartValueFromID(id);
    return this.currentScore;
  }

  /**
   * A helpful method to determine whether the Throw has been completed.
   *
   * @return {boolean} True if the Throw is complete, otherwise false.
   */
  isThrowComplete() {
    return this.darts.three !== undefined;
  }

  /**
   * Adds the next dart in the current Throw.
   *
   * 1. Determine which dart needs to be added.
   * 2. Add the dart.
   * 3. Update the total for this Throw.
   * 4. Update the current score to take into account the latest total.
   *
   * @param {string} id The ID of the area of the dartboard that has been hit.
   * @param {number} currentScore The Player's current game score.
   */
  addDart(id, currentScore) {
    // [1]
    let dart = "";
    if (this.darts.three == undefined) dart = "three";
    if (this.darts.two == undefined) dart = "two";
    if (this.darts.one == undefined) dart = "one";

    // [2]
    this.darts[dart] = id;

    // [3]
    this.calculateTotal();

    // [4]
    this.calculateCurrentScore(currentScore, id);
  }
}

/**
 * Player class.
 */
class Player {
  /**
   * @constructor
   *
   * @param {number} id The Player ID.
   */
  constructor(id) {
    /**
     * @type {number} The Player ID.
     */
    this.id = id;

    /**
     * @type {number} The starting score of the game.
     */
    this.currentScore = 501;

    /**
     * Start off with a blank row in the table and a starting score of this.currentScore.
     *
     * @type {Array.<Throw>} A list of all the Throws in the game.
     */
    this.throws = [new Throw("-", "-", "-", "-", "-", this.currentScore)];
  }

  /**
   * @return The Player's current Throw.
   */
  get currentThrow() {
    return this.throws[this.throws.length - 1];
  }

  /**
   * Adds the dart to the Player's list of Throws.
   *
   * 1. If the previous Throw is complete, add a new Throw with an incremented ID.
   * 2. Add the dart to the current Throw.
   */
  addDart(id) {
    // [1]
    if (this.currentThrow.isThrowComplete()) {
      this.throws.push(new Throw(this.throws.length));
    }

    // [2]
    this.currentThrow.addDart(id, this.currentScore);
  }
}

/**
 * Game class.
 *
 * Holds all of the game state information.
 */
class Game {
  /**
   * @constructor
   */
  constructor() {
    /**
     * @type {Object.<Player>} A list of Players in the Game.
     */
    this.player = {
      one: new Player(1),
      two: new Player(2),
    };

    /**
     * @type {Player} The current Player.
     */
    this.currentPlayer = this.player.one;
  }

  /**
   * Switches Players.
   */
  switchPlayers() {
    this.currentPlayer =
      this.player[this.currentPlayer.id === 1 ? "two" : "one"];
  }

  /**
   * Add the new dart info to the Player.
   *
   * 1. Add the value of the dart into the list of Throws.
   * 2. Update the Player's current score.
   * 3. If the Player's Throw is complete, switch Players.
   *
   * @param {string} id The ID of the area of the dartboard that has been hit.
   */
  addDart(id) {
    // [1]
    this.currentPlayer.addDart(id);

    // [2]
    this.currentPlayer.currentScore =
      this.currentPlayer.currentThrow.calculateCurrentScore(
        this.currentPlayer.currentScore,
        id
      );

    // [3]
    if (this.currentPlayer.currentThrow.isThrowComplete()) {
      this.switchPlayers();
    }
  }
}

/**
 * Angular app & controller.
 */
angular.module("app", []).controller("gameCtrl", ($scope) => {
  /**
   * @type {NodeList} All of the sections of the dartboard.
   */
  $scope.dartboardSections = document.querySelectorAll(
    "#dartboard #areas g path, #dartboard #areas g circle"
  );

  /**
   * Game state setup.
   */
  $scope.init = () => ($scope.game = new Game());
  $scope.init();

  /**
   * Dartboard click handler.
   *
   * 1. Add the dart values to the current Throw.
   * 2. If either Player's score is 0 (i.e. someone's won the game), remove the event handler from the dartboard segments.
   * 3. Apply the scope manually because Angular doesn't realise anything's changed.
   *
   * @param {Object} event the click event fired when clicking sections of the dartboard.
   */
  $scope.boardClickHandler = (event) => {
    // [1]
    $scope.game.addDart(event.target.getAttribute("id"));

    // [2]
    if (
      $scope.game.player.one.currentScore === 0 ||
      $scope.game.player.two.currentScore === 0
    ) {
      $scope.dartboardSections.forEach((p) =>
        p.removeEventListener("click", $scope.boardClickHandler)
      );
    }

    // [3]
    $scope.$apply();
  };

  /**
   * Attaching the dartboard click handler to the event listener for each of the dartboard segments.
   */
  $scope.dartboardSections.forEach((p) =>
    p.addEventListener("click", $scope.boardClickHandler)
  );
});
