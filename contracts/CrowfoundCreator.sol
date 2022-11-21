// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CrowdFund is ERC20, Ownable {

    event Launched(string _name,string _symbol, uint _date);

    event Cancel(uint _date);
     event Goal(string _str);
    event Refund( address indexed caller, uint amount);
    event TokenSold(address indexed _buyer, uint256 _amount);
    struct Campaign {
        // Creator of campaign
        address  creator;
        // Amount of tokens to raise
        uint goal;
        // Total amount pledged
        uint pledged;
        // Timestamp of start of campaign
        uint startAt;
        // Timestamp of end of campaign
        uint endAt;
        // True if goal was reached and creator has claimed the tokens.
        bool claimed;
    }
    uint256 public constant TOKEN_PRICE = 10 gwei;
    
    bool launched = false;
   
    
    Campaign campaignData;

    constructor(string memory _name, string memory _symbol, uint _goal) ERC20 (_name,_symbol) {
        
         campaignData.creator= msg.sender;
         campaignData.goal=_goal;
         campaignData.pledged=0;
         
         campaignData.claimed=false;
        
       
        _mint(address(this),_goal);

         
    }
    function decimals() public view virtual override returns (uint8) {
        return 4;
    }
    // IERC20 public immutable token;
    // //completar
    function launch(uint _startAt,uint _endAt) public onlyOwner {
        campaignData.startAt=_startAt;
         campaignData.endAt=_endAt;
       
        launched = true;
        emit Launched (name(),symbol(),block.timestamp);
    }
    function cancel() public onlyOwner {
        launched = false;
        emit Cancel(block.timestamp);

    }

    function buyTokens(uint256 _amount) public payable {
        require(launched,"Project isn't lunched yet");
        require(msg.value == _amount * TOKEN_PRICE,"Wrong Amount");
        this.transfer(msg.sender, _amount);
        
        campaignData.pledged+=msg.value;
        emit TokenSold(msg.sender, _amount);

        if (campaignData.pledged >= campaignData.goal){
            cancel();
            emit Goal("Goal achived");

        }
    }

    

    function withdrawFound() public onlyOwner {
        uint _today = block.timestamp;
        
        require(campaignData.pledged>=campaignData.goal, "You haven't reach the pledge");
        require(campaignData.endAt>=_today, "Have to wait until time is up");
        payable(msg.sender).transfer(campaignData.pledged);
    }

    // function transferFounds (uint ammount) public payable {
        
    //     this.transfer(msg.sender,ammount);
    //     campaignData.pledged+=msg.value;
    // }
    function claimFounds() public  {
       
        if (!launched){
       require(block.timestamp>campaignData.endAt, "Have to wait until time is up");
        require(campaignData.pledged>=campaignData.goal, "Goal was accomplished");}
        uint256 userTokens=balanceOf(msg.sender);
        require(userTokens>0,"This address has nothing to claim");
        uint256 ethersToClaim=userTokens*TOKEN_PRICE;
        _burn(msg.sender,userTokens);
        payable(msg.sender).transfer(ethersToClaim);
    
        campaignData.pledged -= ethersToClaim;
       
        emit Refund(msg.sender,ethersToClaim);

    }

}